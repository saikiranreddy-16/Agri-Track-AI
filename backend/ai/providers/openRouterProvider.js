import BaseProvider from './baseProvider.js';
import axios from 'axios';
import { estimateTokens } from '../utils/tokenEstimator.js';

export class OpenRouterProvider extends BaseProvider {
  constructor(config) {
    super(config);
  }

  /**
   * Generates AI text using OpenRouter Chat Completions API.
   * Supports free models (e.g. openrouter/free, google/gemma-3-27b-it:free).
   */
  async generateResponse(prompt, context = {}, history = []) {
    if (!this.config.openrouterApiKey) {
      throw new Error('OpenRouter API Key is not configured.');
    }

    const baseUrl = (this.config.openrouterBaseUrl || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const url = `${baseUrl}/chat/completions`;
    const modelName = this.config.model || this.config.openrouterModel || 'openrouter/free';

    const messages = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        if (item.role && item.content) {
          messages.push({ role: item.role, content: item.content });
        }
      }
    }
    messages.push({ role: 'user', content: prompt });

    const payload = {
      model: modelName,
      messages,
      temperature: this.config.temperature ?? 0.3,
      top_p: this.config.topP ?? 1.0,
      max_tokens: this.config.maxTokens ?? 1500,
    };

    const headers = {
      'Authorization': `Bearer ${this.config.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://agritrack.in',
      'X-Title': 'AgriTrack AI Platform'
    };

    const maxRetries = this.config.retryAttempts ?? 2;
    const timeoutVal = this.config.timeout ?? 15000;

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const response = await axios.post(url, payload, { headers, timeout: timeoutVal });
        const choice = response.data?.choices?.[0];
        const text = choice?.message?.content || choice?.text;

        if (!text) {
          throw new Error('Empty text content received from OpenRouter API.');
        }

        const usage = response.data?.usage || {};
        const promptTokens = usage.prompt_tokens || this.estimateTokens(prompt);
        const completionTokens = usage.completion_tokens || this.estimateTokens(text);
        const tokens = usage.total_tokens || (promptTokens + completionTokens);

        return {
          text,
          tokens,
          promptTokens,
          completionTokens,
          model: response.data?.model || modelName,
          finishReason: choice?.finish_reason || 'stop'
        };
      } catch (err) {
        lastError = err;
        const status = err.response?.status ? ` (Status ${err.response.status})` : '';
        console.warn(`OpenRouter API call failed on attempt ${attempt}/${maxRetries + 1}${status}: ${err.message}`);

        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new Error(`OpenRouter failed after ${maxRetries + 1} attempts. Last error: ${lastError.message}`);
  }

  /**
   * Lightweight health check via small inference completion request.
   */
  async healthCheck() {
    try {
      if (!this.config.openrouterApiKey) return false;
      const baseUrl = (this.config.openrouterBaseUrl || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
      const url = `${baseUrl}/chat/completions`;

      const response = await axios.post(
        url,
        {
          model: this.config.model || this.config.openrouterModel || 'openrouter/free',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.openrouterApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );
      return response.status === 200 && !!response.data?.choices?.[0];
    } catch (err) {
      return false;
    }
  }

  estimateTokens(text) {
    return estimateTokens(text);
  }
}

export default OpenRouterProvider;
