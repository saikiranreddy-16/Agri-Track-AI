// Centralized constants for the AI subsystem
export const PROVIDERS = {
  MOCK: 'mock',
  GEMINI: 'gemini',
  OPENAI: 'openai',
  OLLAMA: 'ollama',
  HUGGINGFACE: 'huggingface'
};

export const MODELS = {
  [PROVIDERS.MOCK]: 'mock',
  [PROVIDERS.GEMINI]: 'gemini-1.5-flash',
  [PROVIDERS.OPENAI]: 'gpt-4o-mini',
  [PROVIDERS.OLLAMA]: 'llama3',
  [PROVIDERS.HUGGINGFACE]: 'gpt2'
};

export const PROMPT_TYPES = {
  CHAT: 'chat',
  REPORT: 'report',
  ANALYSIS: 'analysis',
  SUMMARY: 'summary'
};

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  TIMEOUT: 'TIMEOUT',
  PROVIDER_OFFLINE: 'PROVIDER_OFFLINE',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_PROMPT: 'INVALID_PROMPT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const CACHE_KEYS = {
  PREFIX: 'ai:cache:'
};

export const LIMITS = {
  MAX_PROMPT_LENGTH: 8000,
  DEFAULT_CACHE_DURATION_MINUTES: 10
};
