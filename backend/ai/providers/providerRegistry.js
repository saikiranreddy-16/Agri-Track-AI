import { MockProvider } from './mockProvider.js';
import { GeminiProvider } from './geminiProvider.js';
import { OllamaProvider } from './ollamaProvider.js';
import { HuggingFaceProvider } from './huggingfaceProvider.js';
import { OpenAIProvider } from './openaiProvider.js';

export const providerRegistry = {
  mock: MockProvider,
  gemini: GeminiProvider,
  ollama: OllamaProvider,
  huggingface: HuggingFaceProvider,
  openai: OpenAIProvider
};

export default providerRegistry;
