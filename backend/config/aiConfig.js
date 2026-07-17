export const getAIConfig = () => {
  return {
    provider: process.env.AI_PROVIDER || 'mock',
    temperature: Number(process.env.AI_TEMPERATURE) || 0.7,
    maxTokens: Number(process.env.AI_MAX_TOKENS) || 1000,
    model: process.env.AI_MODEL || 'mock-model',
    language: process.env.AI_LANGUAGE || 'en',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  };
};
