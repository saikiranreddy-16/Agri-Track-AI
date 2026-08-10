import BaseProvider from './baseProvider.js';
import axios from 'axios';
import { estimateTokens } from '../utils/tokenEstimator.js';

export class HuggingFaceProvider extends BaseProvider {
  constructor(config) {
    super(config);
  }

  async generateResponse(prompt) {
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      throw new Error('Hugging Face API Key (HF_API_KEY) is not configured.');
    }

    const modelName = this.config.model || 'gpt2';
    const url = `https://api-inference.huggingface.co/models/${modelName}`;

    const response = await axios.post(
      url,
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: this.config.timeout || 20000,
      }
    );

    const text = response.data?.[0]?.generated_text || response.data?.generated_text;

    if (!text) {
      throw new Error('Empty response received from Hugging Face Inference API.');
    }

    return {
      text,
      tokens: this.estimateTokens(text),
    };
  }

  async healthCheck() {
    try {
      const apiKey = process.env.HF_API_KEY;
      if (!apiKey) return false;
      const modelName = this.config.model || 'gpt2';
      const url = `https://api-inference.huggingface.co/models/${modelName}`;
      // Just check if we can query api endpoints (using empty inputs or headers)
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 3000
      });
      return response.status === 200;
    } catch (err) {
      // API endpoints might return 400 for get but if it reaches the service it's up
      return err.response && err.response.status !== 404;
    }
  }

  estimateTokens(text) {
    return estimateTokens(text);
  }
}
export default HuggingFaceProvider;
