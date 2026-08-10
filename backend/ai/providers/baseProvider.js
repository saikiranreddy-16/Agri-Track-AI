/**
 * Abstract Base Provider defining the common interface contract for all providers.
 */
export class BaseProvider {
  constructor(config) {
    if (this.constructor === BaseProvider) {
      throw new Error("Abstract classes cannot be directly instantiated.");
    }
    this.config = config;
  }

  /**
   * Generates AI text based on raw prompt.
   * @param {string} prompt
   * @returns {Promise<Object>} Object containing { text, tokens }
   */
  async generateResponse(prompt) {
    throw new Error('Method "generateResponse(prompt)" must be implemented.');
  }

  /**
   * Performs self diagnostic health checks.
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    throw new Error('Method "healthCheck()" must be implemented.');
  }

  /**
   * Returns current active model key.
   * @returns {string}
   */
  getModel() {
    return this.config.model || 'default';
  }

  /**
   * Estimates tokens for prompt/response.
   * @param {string} text
   * @returns {number}
   */
  estimateTokens(text) {
    throw new Error('Method "estimateTokens(text)" must be implemented.');
  }
}
export default BaseProvider;
