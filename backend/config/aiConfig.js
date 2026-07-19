import AISetting from '../models/aiSettingModel.js';

let cachedConfig = null;

/**
 * Loads AI settings from database into cache. Fallbacks to environment variables.
 */
export const loadAIConfigFromDB = async () => {
  try {
    let settings = await AISetting.findOne();
    if (!settings) {
      settings = await AISetting.create({
        provider: process.env.AI_PROVIDER || 'mock',
        model: process.env.AI_MODEL || 'default',
        temperature: Number(process.env.AI_TEMPERATURE) || 0.4,
        topP: Number(process.env.AI_TOP_P) || 0.9,
        maxTokens: Number(process.env.AI_MAX_TOKENS) || 2048,
        timeout: Number(process.env.AI_TIMEOUT) || 5000,
        retryAttempts: 2,
        cacheDuration: Number(process.env.AI_CACHE_MINUTES) || 10
      });
    }
    cachedConfig = {
      provider: settings.provider,
      model: settings.model === 'default' && settings.provider === 'gemini' 
        ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash') 
        : settings.model,
      temperature: settings.temperature,
      topP: settings.topP,
      maxTokens: settings.maxTokens,
      timeout: settings.timeout,
      retryAttempts: settings.retryAttempts,
      cacheDuration: settings.cacheDuration,
      version: '1.0.0',
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    };
    return cachedConfig;
  } catch (err) {
    console.error('Failed to load AI config from DB, using fallback env:', err.message);
    return getFallbackConfig();
  }
};

const getFallbackConfig = () => {
  const provider = process.env.AI_PROVIDER || 'mock';
  const rawModel = process.env.AI_MODEL || 'default';
  const model = rawModel === 'default' && provider === 'gemini' 
    ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash') 
    : rawModel;

  return {
    provider,
    model,
    temperature: Number(process.env.AI_TEMPERATURE) || 0.4,
    topP: Number(process.env.AI_TOP_P) || 0.9,
    maxTokens: Number(process.env.AI_MAX_TOKENS) || 2048,
    timeout: Number(process.env.AI_TIMEOUT) || 5000,
    retryAttempts: 2,
    cacheDuration: Number(process.env.AI_CACHE_MINUTES) || 10,
    version: '1.0.0',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  };
};

/**
 * Synchronous accessor to cached config parameters.
 */
export const getAIConfig = () => {
  if (cachedConfig) return cachedConfig;
  return getFallbackConfig();
};

/**
 * Updates the runtime config cache (called when database changes are made via settings controller).
 */
export const updateCachedAIConfig = (newSettings) => {
  cachedConfig = {
    ...cachedConfig,
    provider: newSettings.provider,
    model: newSettings.model === 'default' && newSettings.provider === 'gemini'
      ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash')
      : newSettings.model,
    temperature: newSettings.temperature,
    topP: newSettings.topP,
    maxTokens: newSettings.maxTokens,
    timeout: newSettings.timeout,
    retryAttempts: newSettings.retryAttempts,
    cacheDuration: newSettings.cacheDuration
  };
};
