import axios from 'axios';

export class OllamaProvider {
  constructor(config) {
    this.config = config;
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

    const response = await axios.post(url, payload, { timeout: 20000 });
    const text = response.data?.response;

    if (!text) {
      throw new Error('Empty response received from Ollama API.');
    }

    return {
      text,
      tokens: Math.ceil(text.length / 4),
    };
  }
}
