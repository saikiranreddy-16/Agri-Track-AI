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
        provider: process.env.AI_PROVIDER || 'openrouter',
        model: process.env.OPENROUTER_MODEL || process.env.AI_MODEL || 'openrouter/free',
        temperature: Number(process.env.AI_TEMPERATURE) || 0.3,
        topP: Number(process.env.AI_TOP_P) || 1.0,
        maxTokens: Number(process.env.AI_MAX_TOKENS) || 1500,
        timeout: Number(process.env.AI_TIMEOUT) || 15000,
        retryAttempts: Number(process.env.AI_RETRIES) || 2,
        cacheDuration: Number(process.env.AI_CACHE_MINUTES) || 10
      });
    }
    const resolveModel = (p, m) => {
      if (m && m !== 'default') return m;
      if (p === 'openrouter') return process.env.OPENROUTER_MODEL || 'openrouter/free';
      if (p === 'gemini') return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      return 'default';
    };

    cachedConfig = {
      provider: settings.provider || process.env.AI_PROVIDER || 'openrouter',
      model: resolveModel(settings.provider, settings.model),
      temperature: settings.temperature ?? (Number(process.env.AI_TEMPERATURE) || 0.3),
      topP: settings.topP ?? (Number(process.env.AI_TOP_P) || 1.0),
      maxTokens: settings.maxTokens ?? (Number(process.env.AI_MAX_TOKENS) || 1500),
      timeout: settings.timeout ?? (Number(process.env.AI_TIMEOUT) || 15000),
      retryAttempts: settings.retryAttempts ?? (Number(process.env.AI_RETRIES) || 2),
      cacheDuration: settings.cacheDuration || 10,
      version: '1.0.0',
      openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
      openrouterModel: process.env.OPENROUTER_MODEL || 'openrouter/free',
      openrouterBaseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
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
  const provider = process.env.AI_PROVIDER || 'openrouter';
  const rawModel = process.env.AI_MODEL || process.env.OPENROUTER_MODEL || 'openrouter/free';
  const model = (rawModel === 'default' || !rawModel)
    ? (provider === 'openrouter' ? (process.env.OPENROUTER_MODEL || 'openrouter/free') : 'gemini-2.5-flash')
    : rawModel;

  return {
    provider,
    model,
    temperature: Number(process.env.AI_TEMPERATURE) || 0.3,
    topP: Number(process.env.AI_TOP_P) || 1.0,
    maxTokens: Number(process.env.AI_MAX_TOKENS) || 1500,
    timeout: Number(process.env.AI_TIMEOUT) || 15000,
    retryAttempts: Number(process.env.AI_RETRIES) || 2,
    cacheDuration: Number(process.env.AI_CACHE_MINUTES) || 10,
    version: '1.0.0',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openrouterModel: process.env.OPENROUTER_MODEL || 'openrouter/free',
    openrouterBaseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
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
  const provider = newSettings.provider || cachedConfig?.provider || 'openrouter';
  const rawModel = newSettings.model;
  const model = (rawModel && rawModel !== 'default') 
    ? rawModel 
    : (provider === 'openrouter' ? (process.env.OPENROUTER_MODEL || 'openrouter/free') : 'gemini-2.5-flash');

  cachedConfig = {
    ...cachedConfig,
    provider,
    model,
    temperature: newSettings.temperature ?? cachedConfig?.temperature ?? 0.3,
    topP: newSettings.topP ?? cachedConfig?.topP ?? 1.0,
    maxTokens: newSettings.maxTokens ?? cachedConfig?.maxTokens ?? 1500,
    timeout: newSettings.timeout ?? cachedConfig?.timeout ?? 15000,
    retryAttempts: newSettings.retryAttempts ?? cachedConfig?.retryAttempts ?? 2,
    cacheDuration: newSettings.cacheDuration ?? cachedConfig?.cacheDuration ?? 10
  };
};

