import { getAIConfig } from '../config/aiConfig.js';
import { getProvider } from './providerFactory.js';

export class AIService {
  constructor() {
    const config = getAIConfig();
    this.providerName = config.provider.toLowerCase();
    this.config = config;
    this.provider = getProvider(this.providerName, config);
  }

  /**
   * Generates response from configured AI provider.
   * @param {string} prompt - Raw prompt string (includes templates and context)
   * @returns {Promise<Object>} Object containing { text, tokens }
   */
  async chat(prompt) {
    return await this.provider.generateResponse(prompt);
  }
}

const aiService = new AIService();
export default aiService;
