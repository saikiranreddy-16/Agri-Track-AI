import { getAIConfig } from '../config/aiConfig.js';
import aiService from './aiService.js';
import { buildAIContext } from './contextBuilder.js';
import AILog from '../models/aiLogModel.js';
import * as templates from './promptTemplates/index.js';

/**
 * Helper to measure execution time and log to database
 */
const logAIExecution = async (userId, promptType, provider, startTime, status) => {
  try {
    const executionTime = Date.now() - startTime;
    await AILog.create({
      user: userId,
      promptType,
      executionTime,
      provider,
      status,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to write AI audit log:', err.message);
  }
};

// @desc    Process general chat query
// @route   POST /api/v1/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
  const { prompt } = req.body;
  
  if (!prompt || !prompt.trim()) {
    return next(new Error('Prompt text is required'));
  }

  const config = getAIConfig();
  const startTime = Date.now();

  try {
    const context = await buildAIContext(req.user);
    const formattedPrompt = templates.chatPrompt(context, prompt);
    const aiResult = await aiService.chat(formattedPrompt);
    const latency = Date.now() - startTime;

    await logAIExecution(req.user._id, 'chat', config.provider, startTime, 'success');

    res.status(200).json({
      success: true,
      provider: config.provider,
      model: config.model,
      response: aiResult.text,
      executionTime: latency,
      timestamp: new Date().toISOString(),
      warnings: []
    });
  } catch (error) {
    await logAIExecution(req.user._id, 'chat', config.provider, startTime, 'error');
    next(error);
  }
};

// @desc    Generate daily or weekly reports
// @route   POST /api/v1/ai/report
// @access  Private
export const report = async (req, res, next) => {
  const { type = 'daily' } = req.body;
  const config = getAIConfig();
  const startTime = Date.now();

  try {
    const context = await buildAIContext(req.user);
    
    let formattedPrompt;
    if (type === 'weekly') {
      formattedPrompt = templates.weeklyReportPrompt(context);
    } else if (type === 'utilization') {
      formattedPrompt = templates.machineUtilizationPrompt(context);
    } else if (type === 'inactive') {
      formattedPrompt = templates.inactiveMachinesPrompt(context);
    } else if (type === 'work') {
      formattedPrompt = templates.workSummaryPrompt(context);
    } else {
      formattedPrompt = templates.dailyReportPrompt(context);
    }

    const aiResult = await aiService.chat(formattedPrompt);
    const latency = Date.now() - startTime;

    await logAIExecution(req.user._id, 'report', config.provider, startTime, 'success');

    res.status(200).json({
      success: true,
      provider: config.provider,
      model: config.model,
      response: aiResult.text,
      executionTime: latency,
      timestamp: new Date().toISOString(),
      warnings: []
    });
  } catch (error) {
    await logAIExecution(req.user._id, 'report', config.provider, startTime, 'error');
    next(error);
  }
};

// @desc    Generate analysis reports (e.g. fuel or maintenance predictions)
// @route   POST /api/v1/ai/analysis
// @access  Private
export const analysis = async (req, res, next) => {
  const { type = 'fuel' } = req.body;
  const config = getAIConfig();
  const startTime = Date.now();

  try {
    const context = await buildAIContext(req.user);
    
    let formattedPrompt;
    if (type === 'maintenance') {
      formattedPrompt = templates.maintenancePredictionPrompt(context);
    } else {
      formattedPrompt = templates.fuelAnalysisPrompt(context);
    }

    const aiResult = await aiService.chat(formattedPrompt);
    const latency = Date.now() - startTime;

    await logAIExecution(req.user._id, 'analysis', config.provider, startTime, 'success');

    res.status(200).json({
      success: true,
      provider: config.provider,
      model: config.model,
      response: aiResult.text,
      executionTime: latency,
      timestamp: new Date().toISOString(),
      warnings: []
    });
  } catch (error) {
    await logAIExecution(req.user._id, 'analysis', config.provider, startTime, 'error');
    next(error);
  }
};

// @desc    Generate summaries (e.g. GPS summaries or inactive checks)
// @route   POST /api/v1/ai/summary
// @access  Private
export const summary = async (req, res, next) => {
  const { type = 'gps' } = req.body;
  const config = getAIConfig();
  const startTime = Date.now();

  try {
    const context = await buildAIContext(req.user);
    
    let formattedPrompt;
    if (type === 'gps') {
      formattedPrompt = templates.gpsSummaryPrompt(context);
    } else {
      formattedPrompt = templates.chatPrompt(context, `Provide a general summary of type: ${type}`);
    }

    const aiResult = await aiService.chat(formattedPrompt);
    const latency = Date.now() - startTime;

    await logAIExecution(req.user._id, 'summary', config.provider, startTime, 'success');

    res.status(200).json({
      success: true,
      provider: config.provider,
      model: config.model,
      response: aiResult.text,
      executionTime: latency,
      timestamp: new Date().toISOString(),
      warnings: []
    });
  } catch (error) {
    await logAIExecution(req.user._id, 'summary', config.provider, startTime, 'error');
    next(error);
  }
};

// @desc    Get AI service health status
// @route   GET /api/v1/ai/health
// @access  Public / Private
export const health = async (req, res, next) => {
  const config = getAIConfig();
  res.status(200).json({
    provider: config.provider,
    status: 'healthy',
    model: config.provider === 'mock' ? 'coming soon' : config.model,
    version: config.version || '1.0.0'
  });
};
