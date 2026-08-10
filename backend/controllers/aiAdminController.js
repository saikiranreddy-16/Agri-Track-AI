import { getAIConfig, updateCachedAIConfig } from '../config/aiConfig.js';
import AISetting from '../models/aiSettingModel.js';
import AIUsage from '../models/aiUsageModel.js';
import AIMetrics from '../models/aiMetricsModel.js';
import { getAllHealthStats } from '../ai/providerHealth.js';
import { clearCache } from '../ai/cacheService.js';
import providerManager from '../ai/providerManager.js';

// @desc    Get current AI configuration settings
// @route   GET /api/v1/ai-admin/settings
// @access  Private (Company Admin only)
export const getSettings = async (req, res, next) => {
  try {
    const config = getAIConfig();
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider status/health checks
// @route   GET /api/v1/ai-admin/status
// @access  Private (Company Admin only)
export const getStatus = async (req, res, next) => {
  try {
    const stats = getAllHealthStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall system AI usage statistics
// @route   GET /api/v1/ai-admin/usage
// @access  Private (Company Admin only)
export const getUsage = async (req, res, next) => {
  try {
    const usage = await AIUsage.find()
      .populate('user', 'name email role')
      .sort({ requestDate: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      data: usage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall global AI metrics
// @route   GET /api/v1/ai-admin/metrics
// @access  Private (Company Admin only)
export const getMetrics = async (req, res, next) => {
  try {
    let metrics = await AIMetrics.findOne();
    if (!metrics) {
      metrics = await AIMetrics.create({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalResponseTime: 0,
        fastestResponse: 999999,
        slowestResponse: 0,
        cacheHits: 0,
        cacheMisses: 0
      });
    }

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update/Switch AI provider config
// @route   POST /api/v1/ai-admin/provider
// @access  Private (Company Admin only)
export const changeProvider = async (req, res, next) => {
  const { 
    provider, 
    model, 
    temperature, 
    topP, 
    maxTokens, 
    timeout, 
    retryAttempts, 
    cacheDuration 
  } = req.body;

  try {
    let settings = await AISetting.findOne();
    if (!settings) {
      settings = new AISetting();
    }

    if (provider !== undefined) settings.provider = provider;
    if (model !== undefined) settings.model = model;
    if (temperature !== undefined) settings.temperature = temperature;
    if (topP !== undefined) settings.topP = topP;
    if (maxTokens !== undefined) settings.maxTokens = maxTokens;
    if (timeout !== undefined) settings.timeout = timeout;
    if (retryAttempts !== undefined) settings.retryAttempts = retryAttempts;
    if (cacheDuration !== undefined) settings.cacheDuration = cacheDuration;

    await settings.save();
    
    // Refresh configuration cache
    updateCachedAIConfig(settings);
    providerManager.resetProviders();

    res.status(200).json({
      success: true,
      message: 'AI provider settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Flush the in-memory AI cache
// @route   POST /api/v1/ai-admin/cache/clear
// @access  Private (Company Admin only)
export const clearAICache = async (req, res, next) => {
  try {
    clearCache();
    res.status(200).json({
      success: true,
      message: 'AI cached responses cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
