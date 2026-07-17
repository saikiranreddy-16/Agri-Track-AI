import { collectAIContextData } from '../services/aiDataAccessService.js';
import { successResponse } from '../utils/responseHandler.js';
import aiService from '../ai/aiService.js';
import AIConversation from '../models/aiConversationModel.js';
import { getAIConfig } from '../config/aiConfig.js';

/**
 * Builds an enriched operational snapshot prompt.
 */
export const buildPrompt = (prompt, context) => {
  return `
You are the AgriTrack AI Copilot. Assist the user with their agricultural fleet and farm operations using the verified live data context below.

=== LIVE OPERATIONAL DATA CONTEXT ===
User Name: ${context.userName}
User Role: ${context.userRole}
Farms (${context.farmsCount}): ${context.activeFarms.join(', ') || 'None'}
Vehicles Count: ${context.machinesCount}

Vehicles Status:
${context.machines.map(m => `- ${m.name} (${m.type}) [Chassis: ${m.chassisNumber}]: Status=${m.status}, Fuel=${m.fuel}%, Battery=${m.battery}%, Health=${m.healthScore}%, Speed=${m.speed || 0} km/h, Logged Hours=${m.workingHours || 0}h`).join('\n')}

Active Jobs:
${context.jobs.map(j => `- ${j.title}: Status=${j.status}, Progress=${j.progress}%`).join('\n') || 'None'}

Active Alerts:
${context.alerts.map(a => `- [${a.priority}] ${a.type}: ${a.message} (Status=${a.status})`).join('\n') || 'None'}

Maintenance Schedule:
${context.maintenance.map(m => `- ${m.task}: Status=${m.status}, Date=${m.date}`).join('\n') || 'None'}

=== USER QUESTION ===
${prompt}
  `.trim();
};

// @desc    Process chat request using the registered AI provider
// @route   POST /api/v1/ai/chat
// @access  Private
export const chatAI = async (req, res, next) => {
  const { prompt, vehicleId } = req.body;

  if (!prompt || !prompt.trim()) {
    res.status(400);
    return next(new Error('Prompt text is required'));
  }

  const config = getAIConfig();
  const startTime = Date.now();
  let aiResponseText = '';
  let errorMsg = null;
  let tokensUsed = 0;

  try {
    // 1. Fetch user context securely based on roles
    const context = await collectAIContextData(req.user);

    // 2. Format context prompt
    const richPrompt = buildPrompt(prompt, context);

    // 3. Call the AI service
    const aiResult = await aiService.chat(richPrompt);
    aiResponseText = aiResult.text;
    tokensUsed = aiResult.tokens || 0;

    // Return response
    return successResponse(res, 200, 'AI response generated', {
      response: aiResponseText,
    });
  } catch (error) {
    errorMsg = error.message;
    next(error);
  } finally {
    // 4. Log conversation details asynchronously for diagnostics and auditing
    try {
      const latency = Date.now() - startTime;
      await AIConversation.create({
        user: req.user._id,
        vehicle: vehicleId || null,
        prompt: prompt,
        response: aiResponseText,
        tokens: tokensUsed,
        provider: config.provider,
        latency: latency,
        error: errorMsg,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        model: config.model,
        language: config.language,
      });
    } catch (logError) {
      console.error('Failed to log AI conversation record:', logError.message);
    }
  }
};

// @desc    Secure query to operations AI copilot (backward compatibility wrapper)
// @route   POST /api/v1/ai/query
// @access  Private
export const queryAI = async (req, res, next) => {
  return await chatAI(req, res, next);
};

// @desc    Get AI chat conversation history
// @route   GET /api/v1/ai/history
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    const count = await AIConversation.countDocuments(query);
    const history = await AIConversation.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, 'AI chat history retrieved successfully', history, {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      totalResults: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear AI conversation history
// @route   DELETE /api/v1/ai/history
// @access  Private
export const clearChatHistory = async (req, res, next) => {
  try {
    await AIConversation.deleteMany({ user: req.user._id });
    return successResponse(res, 200, 'AI chat history cleared successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback on an AI message
// @route   POST /api/v1/ai/feedback
// @access  Private
export const submitFeedback = async (req, res, next) => {
  const { conversationId, feedback } = req.body;

  if (!conversationId) {
    res.status(400);
    return next(new Error('Conversation ID is required'));
  }

  if (feedback !== undefined && feedback !== null && !['Thumb Up', 'Thumb Down'].includes(feedback)) {
    res.status(400);
    return next(new Error("Feedback must be one of: 'Thumb Up', 'Thumb Down', or null"));
  }

  try {
    const conversation = await AIConversation.findOne({ _id: conversationId, user: req.user._id });
    if (!conversation) {
      res.status(404);
      return next(new Error('AI Conversation message not found or access denied.'));
    }

    conversation.feedback = feedback;
    await conversation.save();

    return successResponse(res, 200, 'Feedback recorded successfully', conversation);
  } catch (error) {
    next(error);
  }
};
