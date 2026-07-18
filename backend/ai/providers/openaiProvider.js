import axios from 'axios';

export class OpenAIProvider {
  constructor(config) {
    this.config = config;
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
      tokens: response.data?.usage?.total_tokens || Math.ceil(text.length / 4),
    };
  }
}
