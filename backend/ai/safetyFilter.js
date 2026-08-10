import { LIMITS } from '../constants/aiConstants.js';

/**
 * Validates prompt safety parameters and sanitizes text inputs.
 * @param {string} prompt - Raw user prompt input
 * @returns {Object} Object indicating safety status: { safe: boolean, reason?: string, sanitizedPrompt?: string }
 */
export const validateSafety = (prompt = '') => {
  if (prompt === null || prompt === undefined) {
    return { safe: false, reason: 'Prompt is required and cannot be empty.' };
  }

  // 1. Unicode Normalization
  let normalized = String(prompt).normalize('NFC');

  // 2. Trim and check empty bounds
  const trimmed = normalized.trim();
  if (trimmed === '') {
    return { safe: false, reason: 'Prompt cannot be empty.' };
  }

  // 3. Size constraints validation
  if (trimmed.length > LIMITS.MAX_PROMPT_LENGTH) {
    return { 
      safe: false, 
      reason: `Prompt length exceeds maximum allowed limit of ${LIMITS.MAX_PROMPT_LENGTH} characters.` 
    };
  }

  // 4. Input sanitization (strip potential control characters/backslashes)
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, '');

  // 5. Prompt injection keyword filters
  const lowerPrompt = sanitized.toLowerCase();
  const blacklistedKeywords = [
    'ignore previous instructions',
    'reveal system prompt',
    'print environment variables',
    'read .env',
    'access mongodb',
    'execute code',
    'bypass safety',
    'system prompt',
    'database credentials',
    'process.env'
  ];

  for (const keyword of blacklistedKeywords) {
    if (lowerPrompt.includes(keyword)) {
      return { 
        safe: false, 
        reason: 'Potential prompt injection attempt or safety policy violation detected.' 
      };
    }
  }

  return {
    safe: true,
    sanitizedPrompt: sanitized
  };
};

export default validateSafety;
