import axios from 'axios';

export class GeminiProvider {
  constructor(config) {
    this.config = config;
  }

  async generateResponse(prompt) {
    if (!this.config.geminiApiKey) {
      throw new Error('Gemini API Key is not configured.');
    }

    const modelName = this.config.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.config.geminiApiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      }
    };

    const response = await axios.post(url, payload, { timeout: 15000 });
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty response received from Gemini API.');
    }

    return {
      text,
      tokens: response.data?.usageMetadata?.totalTokenCount || Math.ceil(text.length / 4),
    };
  }
}
