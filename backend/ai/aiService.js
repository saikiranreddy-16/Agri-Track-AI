import providerManager from './providerManager.js';
import { getCachedResponse, setCachedResponse } from './cacheService.js';
import { validateSafety } from './safetyFilter.js';
import { formatAIResponse } from './outputFormatter.js';
import { getAIConfig } from '../config/aiConfig.js';
import { estimateTokens } from './utils/tokenEstimator.js';

export class AIService {
  /**
   * Generates AI responses incorporating safety checks, cache lookups, history, and provider managers.
   * @param {string} prompt - Raw query prompt
   * @param {Array} history - Previous conversation messages list
   * @param {Object} context - Sanitized database context parameters
   * @param {string} userId - ID of current user
   * @param {string} promptType - Prompt category mapping
   * @param {string} conversationId - Conversation session ID
   * @returns {Promise<Object>} Formatted AI completion object
   */
  async chat(prompt, history = [], context = {}, userId, promptType = 'chat', conversationId = '') {
    const config = getAIConfig();
    const startTime = Date.now();

    // 1. Safety Checks & Sanitization
    const safety = validateSafety(prompt);
    if (!safety.safe) {
      throw new Error(safety.reason);
    }

    const sanitizedPrompt = safety.sanitizedPrompt || prompt;

    // 2. Cache Lookup (transparent lookup inside aiService)
    const cachedAnswer = getCachedResponse(userId, sanitizedPrompt, promptType, config.provider);
    if (cachedAnswer) {
      const executionTime = Date.now() - startTime;
      const tokensCount = estimateTokens(sanitizedPrompt) + estimateTokens(cachedAnswer);
      
      return formatAIResponse(
        cachedAnswer,
        config.provider,
        config.model,
        executionTime,
        true, // cached = true
        tokensCount,
        conversationId
      );
    }

    // 3. Assemble Memory History
    const memoryLimit = 10;
    const historyToInclude = history.slice(-memoryLimit);
    
    let enrichedPrompt = '';
    
    if (historyToInclude.length > 0) {
      enrichedPrompt += "=== CONVERSATION MEMORY (PAST MESSAGES) ===\n";
      historyToInclude.forEach(msg => {
        const queryText = msg.originalQuestion || '';
        const responseText = msg.aiResponse || '';
        enrichedPrompt += `User: ${queryText}\nAssistant: ${responseText}\n---\n`;
      });
      enrichedPrompt += "\n";
    }
    
    enrichedPrompt += `=== CURRENT REQUEST ===\n${sanitizedPrompt}`;

    // 4. Delegate active generation call to ProviderManager
    const result = await providerManager.generateResponse(enrichedPrompt, context, historyToInclude);
    const executionTime = Date.now() - startTime;

    // 5. Caching and storage (transparently stored on success)
    if (result && result.text) {
      setCachedResponse(userId, sanitizedPrompt, promptType, config.provider, result.text, config.cacheDuration);
    }

    // 6. Unify format mapping using outputFormatter
    return formatAIResponse(
      result.text,
      result.providerUsed || config.provider,
      config.model,
      executionTime,
      false, // cached = false
      result.tokens,
      conversationId
    );
  }
}

const aiService = new AIService();
export default aiService;
