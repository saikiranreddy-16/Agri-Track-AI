import { getAIConfig } from '../config/aiConfig.js';
import aiService from './aiService.js';
import { optimizePrompt } from './promptEngine.js';
import AIConversation from '../models/aiConversationModel.js';
import AILog from '../models/aiLogModel.js';
import AIUsage from '../models/aiUsageModel.js';
import AIMetrics from '../models/aiMetricsModel.js';
import { logHealthStats } from './providerHealth.js';

/**
 * Log AI Audit logs (Phase 10)
 */
const writeAILog = async (userId, action, provider, responseTime = 0) => {
  try {
    await AILog.create({
      user: userId,
      action,
      provider,
      responseTime,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to log AI activity:', err.message);
  }
};

/**
 * Helper to update user usage statistics (Phase 3)
 */
const recordUsage = async (userId, provider, model, tokens, latency, isSuccess) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await AIUsage.findOne({
      user: userId,
      provider,
      model,
      requestDate: today
    });

    if (!usage) {
      usage = new AIUsage({
        user: userId,
        provider,
        model,
        requestDate: today
      });
    }

    usage.requestCount += 1;
    usage.tokenCount += tokens;
    // Calculate rolling average latency
    usage.responseTime = usage.requestCount > 1
      ? Math.round((usage.responseTime * (usage.requestCount - 1) + latency) / usage.requestCount)
      : latency;

    if (isSuccess) {
      usage.successCount += 1;
    } else {
      usage.failedCount += 1;
    }

    await usage.save();
  } catch (err) {
    console.error('Failed to record AI usage:', err.message);
  }
};

/**
 * Helper to update global system metrics (Phase 6)
 */
const recordAIMetric = async (responseTime, isSuccess, isCacheHit) => {
  try {
    let metrics = await AIMetrics.findOne();
    if (!metrics) {
      metrics = new AIMetrics();
    }

    metrics.totalRequests += 1;
    if (isCacheHit) {
      metrics.cacheHits += 1;
    } else {
      metrics.cacheMisses += 1;
      if (isSuccess) {
        metrics.successfulRequests += 1;
        metrics.totalResponseTime += responseTime;
        if (responseTime < metrics.fastestResponse) metrics.fastestResponse = responseTime;
        if (responseTime > metrics.slowestResponse) metrics.slowestResponse = responseTime;
      } else {
        metrics.failedRequests += 1;
      }
    }

    await metrics.save();
  } catch (err) {
    console.error('Failed to record AI metrics:', err.message);
  }
};

// @desc    Create a new AI conversation session
// @route   POST /api/v1/ai/conversation
// @access  Private
export const createConversation = async (req, res, next) => {
  const { title = 'New Conversation' } = req.body;
  const config = getAIConfig();

  try {
    const conversation = await AIConversation.create({
      user: req.user._id,
      userRole: req.user.role,
      title,
      messages: [],
      provider: config.provider,
      model: config.model
    });

    await writeAILog(req.user._id, 'Conversation Created', config.provider, 0);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message to continue an existing conversation
// @route   POST /api/v1/ai/conversation/:id/chat
// @access  Private
export const continueConversation = async (req, res, next) => {
  const { prompt } = req.body;
  const { id } = req.params;

  const config = getAIConfig();
  const startTime = Date.now();

  try {
    const conversation = await AIConversation.findOne({ _id: id, isDeleted: false });
    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    // Security isolation check
    if (conversation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. You do not own this conversation.'));
    }

    // 1. Audit Message Submission
    await writeAILog(req.user._id, 'Message Sent', config.provider, 0);

    // 2. Optimize prompt & fetch live data context
    const { optimizedPrompt, promptType, context } = await optimizePrompt(prompt, req.user);

    // 3. Delegate cache checks, safety checking, and provider calls entirely to aiService (Thin Controller pattern)
    const aiResult = await aiService.chat(
      optimizedPrompt,
      conversation.messages,
      context,
      req.user._id,
      promptType,
      id
    );

    // 4. Save dialogue turns
    conversation.messages.push({
      sender: 'user',
      originalQuestion: prompt,
      optimizedPrompt: optimizedPrompt
    });

    conversation.messages.push({
      sender: 'assistant',
      originalQuestion: prompt,
      optimizedPrompt: optimizedPrompt,
      aiResponse: aiResult.answer
    });

    conversation.responseTime = aiResult.executionTime;
    conversation.tokens = (conversation.tokens || 0) + aiResult.estimatedTokens;
    await conversation.save();

    // 5. Track analytics, usage and health metrics
    await recordAIMetric(aiResult.executionTime, true, aiResult.cached);
    await recordUsage(req.user._id, aiResult.provider, aiResult.model, aiResult.estimatedTokens, aiResult.executionTime, true);
    logHealthStats(aiResult.provider, aiResult.executionTime, true);
    await writeAILog(req.user._id, 'AI Response Generated', aiResult.provider, aiResult.executionTime);

    // Standardized response format
    res.status(200).json({
      success: true,
      provider: aiResult.provider,
      model: aiResult.model,
      response: aiResult.answer,
      executionTime: aiResult.executionTime,
      timestamp: new Date().toISOString(),
      warnings: aiResult.cached ? ['Response retrieved from cache'] : [],
      messages: conversation.messages
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    await recordAIMetric(latency, false, false);
    await recordUsage(req.user._id, config.provider, config.model, 0, latency, false);
    logHealthStats(config.provider, latency, false);
    next(error);
  }
};

// @desc    Get all active conversations for the logged-in user
// @route   GET /api/v1/ai/conversation
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await AIConversation.find({
      user: req.user._id,
      isDeleted: false
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get details of a single conversation
// @route   GET /api/v1/ai/conversation/:id
// @access  Private
export const getConversation = async (req, res, next) => {
  const { id } = req.params;

  try {
    const conversation = await AIConversation.findOne({
      _id: id,
      isDeleted: false
    });

    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    if (conversation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. You do not own this conversation.'));
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rename a conversation
// @route   PUT /api/v1/ai/conversation/:id
// @access  Private
export const renameConversation = async (req, res, next) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    return next(new Error('Title is required'));
  }

  try {
    const conversation = await AIConversation.findOne({ _id: id, isDeleted: false });
    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    if (conversation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. You do not own this conversation.'));
    }

    conversation.title = title;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation renamed successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a conversation
// @route   DELETE /api/v1/ai/conversation/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  const { id } = req.params;

  try {
    const conversation = await AIConversation.findOne({ _id: id, isDeleted: false });
    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    if (conversation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. You do not own this conversation.'));
    }

    conversation.isDeleted = true;
    await conversation.save();

    await writeAILog(req.user._id, 'Conversation Deleted', conversation.provider, 0);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle archive status on a conversation
// @route   PATCH /api/v1/ai/conversation/:id/archive
// @access  Private
export const archiveConversation = async (req, res, next) => {
  const { id } = req.params;

  try {
    const conversation = await AIConversation.findOne({ _id: id, isDeleted: false });
    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    if (conversation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. You do not own this conversation.'));
    }

    conversation.isArchived = !conversation.isArchived;
    await conversation.save();

    await writeAILog(req.user._id, 'Conversation Archived', conversation.provider, 0);

    res.status(200).json({
      success: true,
      message: conversation.isArchived ? 'Conversation archived' : 'Conversation unarchived',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all message turns in a conversation
// @route   DELETE /api/v1/ai/conversation/:id/messages
// @access  Private
export const clearConversation = async (req, res, next) => {
  const { id } = req.params;

  try {
    const conversation = await AIConversation.findOne({ _id: id, isDeleted: false });
    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    if (conversation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. You do not own this conversation.'));
    }

    conversation.messages = [];
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation messages cleared',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback (Like/Dislike) per message turn (Phase 8)
// @route   POST /api/v1/ai/conversation/:id/feedback
// @access  Private
export const submitFeedback = async (req, res, next) => {
  const { id } = req.params;
  const { feedback, reason, comment } = req.body;

  if (feedback !== null && !['Like', 'Dislike'].includes(feedback)) {
    res.status(400);
    return next(new Error("Feedback value must be 'Like', 'Dislike', or null"));
  }

  if (reason && !['Incorrect', 'Incomplete', 'Too Long', 'Hallucination', 'Other'].includes(reason)) {
    res.status(400);
    return next(new Error("Feedback reason must be one of: 'Incorrect', 'Incomplete', 'Too Long', 'Hallucination', 'Other'"));
  }

  try {
    const conversation = await AIConversation.findOne({ _id: id, isDeleted: false });
    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    if (conversation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. You do not own this conversation.'));
    }

    // Update the feedback object on the latest assistant message
    const assistantMsgs = conversation.messages.filter(m => m.sender === 'assistant');
    if (assistantMsgs.length === 0) {
      res.status(400);
      return next(new Error('Cannot submit feedback. No assistant responses exist in this conversation.'));
    }

    const latestAssistantMsg = assistantMsgs[assistantMsgs.length - 1];
    latestAssistantMsg.feedback = {
      type: feedback,
      reason: reason || null,
      comment: comment || '',
      timestamp: new Date()
    };

    await conversation.save();
    await writeAILog(req.user._id, 'Feedback Submitted', conversation.provider, 0);

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/ai/health
export const health = (req, res) => {
  res.status(200).json({
    provider: getAIConfig().provider,
    status: 'healthy'
  });
};
