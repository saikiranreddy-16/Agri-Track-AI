import BaseProvider from './baseProvider.js';
import axios from 'axios';
import { estimateTokens } from '../utils/tokenEstimator.js';

export class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);
  }

  async generateResponse(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API Key (OPENAI_API_KEY) is not configured.');
    }

    const modelName = this.config.model || 'gpt-4o-mini';
    const url = 'https://api.openai.com/v1/chat/completions';

    const payload = {
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    };

    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout || 15000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Empty response received from OpenAI API.');
    }

    return {
      text,
      tokens: response.data?.usage?.total_tokens || this.estimateTokens(text),
    };
  }

  async healthCheck() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return false;
      const url = 'https://api.openai.com/v1/models';
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 3000
      });
      return response.status === 200;
    } catch (err) {
      return false;
    }
  }

  estimateTokens(text) {
    return estimateTokens(text);
  }
}
export default OpenAIProvider;
