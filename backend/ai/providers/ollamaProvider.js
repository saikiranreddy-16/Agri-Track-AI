import BaseProvider from './baseProvider.js';
import axios from 'axios';
import { estimateTokens } from '../utils/tokenEstimator.js';

export class OllamaProvider extends BaseProvider {
  constructor(config) {
    super(config);
  }

  async generateResponse(prompt) {
    const modelName = this.config.model || 'llama3';
    const baseUrl = this.config.ollamaBaseUrl || 'http://localhost:11434';
    const url = `${baseUrl}/api/generate`;

    const payload = {
      model: modelName,
      prompt: prompt,
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      }
    };

    const response = await axios.post(url, payload, { timeout: this.config.timeout || 20000 });
    const text = response.data?.response;

    if (!text) {
      throw new Error('Empty response received from Ollama API.');
    }

    return {
      text,
      tokens: this.estimateTokens(text),
    };
  }

  async healthCheck() {
    try {
      const baseUrl = this.config.ollamaBaseUrl || 'http://localhost:11434';
      const response = await axios.get(`${baseUrl}/`, { timeout: 3000 });
      return response.status === 200;
    } catch (err) {
      return false;
    }
  }

  estimateTokens(text) {
    return estimateTokens(text);
  }
}
export default OllamaProvider;
