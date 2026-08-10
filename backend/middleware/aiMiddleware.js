import { getAIConfig } from '../config/aiConfig.js';
import { LIMITS } from '../constants/aiConstants.js';

/**
 * Middleware to validate AI requests, enforce prompt length checks, and attach runtime configurations.
 */
export const validateAIRequest = (req, res, next) => {
  // Only validate bodies for POST requests containing prompt fields
  if (req.method === 'POST' && (req.path.includes('/chat') || req.path.includes('/conversation'))) {
    const { prompt } = req.body;
    
    if (prompt !== undefined) {
      if (typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400);
        return next(new Error('Prompt is required and cannot be empty.'));
      }
      
      if (prompt.length > LIMITS.MAX_PROMPT_LENGTH) {
        res.status(400);
        return next(new Error(`Prompt length exceeds maximum allowed limit of ${LIMITS.MAX_PROMPT_LENGTH} characters.`));
      }
    }
  }

  // Attach the loaded settings config directly to req for controllers
  req.aiConfig = getAIConfig();
  
  next();
};

export default validateAIRequest;
