/**
 * Approximates token counts from a text string.
 * standard LLM token ratio is ~4 characters per token or ~0.75 words per token.
 * @param {string} text - Raw input prompt or response
 * @returns {number} Estimated token count
 */
export const estimateTokens = (text = '') => {
  if (!text) return 0;
  const cleanText = text.trim();
  if (cleanText === '') return 0;

  const charCount = cleanText.length;
  const wordCount = cleanText.split(/\s+/).length;

  const charEst = Math.ceil(charCount / 4);
  const wordEst = Math.ceil(wordCount / 0.75);

  // Return the average for a balanced estimate
  return Math.ceil((charEst + wordEst) / 2);
};
export default estimateTokens;
