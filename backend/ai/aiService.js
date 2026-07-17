import { getAIConfig } from '../config/aiConfig.js';
import { MockProvider } from './providers/mockProvider.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { OllamaProvider } from './providers/ollamaProvider.js';
import { HuggingFaceProvider } from './providers/huggingfaceProvider.js';

export class AIService {
  constructor() {
    const config = getAIConfig();
    this.providerName = config.provider.toLowerCase();
    this.config = config;

    switch (this.providerName) {
      case 'gemini':
        this.provider = new GeminiProvider(config);
        break;
      case 'ollama':
        this.provider = new OllamaProvider(config);
        break;
      case 'huggingface':
        this.provider = new HuggingFaceProvider(config);
        break;
      case 'mock':
      default:
        this.provider = new MockProvider(config);
        break;
    }
  }

  async chat(prompt) {
    return await this.provider.generateResponse(prompt);
  }
}

const aiService = new AIService();
export default aiService;
