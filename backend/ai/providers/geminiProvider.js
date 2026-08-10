import BaseProvider from './baseProvider.js';
import axios from 'axios';
import { estimateTokens } from '../utils/tokenEstimator.js';

export class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
  }

  /**
   * Generates AI text based on raw prompt with retry loop and timeouts.
   */
  async generateResponse(prompt, context = {}, history = []) {
    if (!this.config.geminiApiKey) {
      throw new Error('Gemini API Key is not configured.');
    }

    const modelName = this.config.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.config.geminiApiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      }
    };

    const maxRetries = this.config.retryAttempts ?? 2;
    const timeoutVal = this.config.timeout ?? 15000;
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const response = await axios.post(url, payload, { timeout: timeoutVal });
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error('Empty response received from Gemini API.');
        }

        const tokens = response.data?.usageMetadata?.totalTokenCount || this.estimateTokens(text);

        return {
          text,
          tokens
        };
      } catch (err) {
        lastError = err;
        console.warn(`Gemini API call failed on attempt ${attempt}/${maxRetries + 1}: ${err.message}`);
        
        // Wait before retrying (exponential backoff)
        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new Error(`Failed to generate response after ${maxRetries + 1} attempts. Last error: ${lastError.message}`);
  }

  async healthCheck() {
    try {
      if (!this.config.geminiApiKey) return false;
      // Simple lightweight request to check service status
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.config.geminiApiKey}`;
      const response = await axios.get(url, { timeout: 3000 });
      return response.status === 200;
    } catch (err) {
      return false;
    }
  }

  estimateTokens(text) {
    return estimateTokens(text);
  }
}
export default GeminiProvider;
