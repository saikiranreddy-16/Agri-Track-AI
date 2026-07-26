import { getAIConfig } from '../config/aiConfig.js';
import providerRegistry from './providers/providerRegistry.js';

class ProviderManager {
  constructor() {
    this.instances = {};
  }

  /**
   * Resolves the configured provider instance.
   * Gracefully falls back to Mock if active key credentials are not found.
   */
  getProvider(providerOverride) {
    const config = getAIConfig();
    let providerKey = (providerOverride || config.provider).toLowerCase();

    if (providerKey === 'openrouter' && !config.openrouterApiKey) {
      console.warn('OpenRouter API key is missing. Cascading to fallback provider...');
      providerKey = config.geminiApiKey ? 'gemini' : 'mock';
    } else if (providerKey === 'gemini' && !config.geminiApiKey) {
      console.warn('Gemini API key is missing. Cascading to Mock provider...');
      providerKey = 'mock';
    }

    if (this.instances[providerKey]) {
      return this.instances[providerKey];
    }

    const ProviderClass = providerRegistry[providerKey] || providerRegistry.mock;
    const instance = new ProviderClass(config);
    this.instances[providerKey] = instance;
    return instance;
  }

  /**
   * Generates AI response using 3-tier failover sequence:
   * OpenRouter -> Gemini -> Mock Provider.
   */
  async generateResponse(prompt, context, history) {
    const config = getAIConfig();
    const primaryKey = (config.provider || 'openrouter').toLowerCase();

    // 3-Tier failover candidate sequence
    const sequence = [];
    if (primaryKey === 'openrouter') {
      if (config.openrouterApiKey) sequence.push('openrouter');
      if (config.geminiApiKey) sequence.push('gemini');
      sequence.push('mock');
    } else if (primaryKey === 'gemini') {
      if (config.geminiApiKey) sequence.push('gemini');
      sequence.push('mock');
    } else {
      sequence.push(primaryKey);
      if (primaryKey !== 'mock') sequence.push('mock');
    }

    let lastError = null;

    for (const key of sequence) {
      try {
        const provider = this.getProvider(key);
        const response = await provider.generateResponse(prompt, context, history);
        return {
          ...response,
          providerUsed: key,
          fallbackTriggered: key !== primaryKey,
          fallbackReason: key !== primaryKey && lastError ? lastError.message : undefined
        };
      } catch (err) {
        lastError = err;
        console.warn(`AI Provider [${key}] execution failed: ${err.message}. Cascading to next candidate...`);
      }
    }

    // Fallback guarantee to Mock Provider
    const mockProvider = this.getProvider('mock');
    const mockResponse = await mockProvider.generateResponse(prompt, context, history);
    return {
      ...mockResponse,
      providerUsed: 'mock',
      fallbackTriggered: true,
      fallbackReason: lastError ? lastError.message : 'Primary providers failed'
    };
  }

  /**
   * Triggers healthcheck diagnostic connection on target provider.
   */
  async checkHealth(providerName) {
    const config = getAIConfig();
    const providerKey = providerName ? providerName.toLowerCase() : (config.provider || 'openrouter').toLowerCase();

    if (providerKey === 'openrouter' && !config.openrouterApiKey) return false;
    if (providerKey === 'gemini' && !config.geminiApiKey) return false;

    const ProviderClass = providerRegistry[providerKey] || providerRegistry.mock;
    const providerInstance = new ProviderClass(config);
    return await providerInstance.healthCheck();
  }

  resetProviders() {
    this.instances = {};
  }
}

const providerManager = new ProviderManager();
export default providerManager;

