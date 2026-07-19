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
    
    // Verify Gemini configuration, falling back to mock provider if key is unconfigured
    if (providerKey === 'gemini' && !config.geminiApiKey) {
      console.warn('Gemini API key is not configured. Automatically falling back to Mock provider.');
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
   * Generates response. Falls back to mock provider if live request triggers errors.
   */
  async generateResponse(prompt, context, history) {
    const provider = this.getProvider();
    try {
      const response = await provider.generateResponse(prompt, context, history);
      return {
        ...response,
        providerUsed: provider.constructor.name.replace('Provider', '').toLowerCase()
      };
    } catch (err) {
      console.error(`AI Provider generation failed: ${err.message}. Triggering Mock fallback...`);
      const mockProvider = this.getProvider('mock');
      const mockResponse = await mockProvider.generateResponse(prompt, context, history);
      return {
        ...mockResponse,
        providerUsed: 'mock',
        fallbackTriggered: true,
        fallbackReason: err.message
      };
    }
  }

  /**
   * Triggers healthcheck diagnostic connections on target provider.
   */
  async checkHealth(providerName) {
    const config = getAIConfig();
    const providerKey = providerName ? providerName.toLowerCase() : config.provider.toLowerCase();
    
    if (providerKey === 'gemini' && !config.geminiApiKey) {
      return false;
    }

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
