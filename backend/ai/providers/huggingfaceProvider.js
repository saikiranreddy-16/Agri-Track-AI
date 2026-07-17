import axios from 'axios';

export class HuggingFaceProvider {
  constructor(config) {
    this.config = config;
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
        timeout: 20000,
      }
    );

    const text = response.data?.[0]?.generated_text || response.data?.generated_text;

    if (!text) {
      throw new Error('Empty response received from Hugging Face Inference API.');
    }

    return {
      text,
      tokens: Math.ceil(text.length / 4),
    };
  }
}
