import { MockProvider } from './mockProvider.js';
import { GeminiProvider } from './geminiProvider.js';
import { OpenRouterProvider } from './openRouterProvider.js';
import { OllamaProvider } from './ollamaProvider.js';
import { HuggingFaceProvider } from './huggingfaceProvider.js';
import { OpenAIProvider } from './openaiProvider.js';

export const providerRegistry = {
  openrouter: OpenRouterProvider,
  gemini: GeminiProvider,
  mock: MockProvider,
  ollama: OllamaProvider,
  huggingface: HuggingFaceProvider,
  openai: OpenAIProvider
};

export default providerRegistry;

