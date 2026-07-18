import { MockProvider } from './providers/mockProvider.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { OllamaProvider } from './providers/ollamaProvider.js';
import { HuggingFaceProvider } from './providers/huggingfaceProvider.js';
import { OpenAIProvider } from './providers/openaiProvider.js';

/**
 * AI Provider Factory to decouple providers from services.
 * @param {string} providerName - Name of the configured AI provider
 * @param {Object} config - AI Configuration object
 * @returns {Object} Instantiated provider instance
 */
export const getProvider = (providerName, config) => {
  switch (providerName?.toLowerCase()) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'ollama':
      return new OllamaProvider(config);
    case 'huggingface':
      return new HuggingFaceProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'mock':
    default:
      return new MockProvider(config);
  }
};
