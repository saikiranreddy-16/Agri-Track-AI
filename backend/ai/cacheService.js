import { LIMITS } from '../constants/aiConstants.js';

const cache = new Map();

/**
 * Generates cache key from request details.
 */
const makeKey = (userId, prompt, promptType, provider) => {
  const normalizedPrompt = prompt?.trim().toLowerCase() || '';
  return `${userId}:${provider}:${promptType}:${normalizedPrompt}`;
};

/**
 * Fetches response from in-memory cache if active and not expired.
 * @returns {Object|null} Cached response entry or null if cache miss.
 */
export const getCachedResponse = (userId, prompt, promptType, provider) => {
  const key = makeKey(userId, prompt, promptType, provider);
  
  if (cache.has(key)) {
    const entry = cache.get(key);
    if (Date.now() < entry.expiry) {
      return entry.value;
    }
    // Delete expired entry
    cache.delete(key);
  }
  return null;
};

/**
 * Saves response payload into cache.
 * @param {string} userId - Current user ID
 * @param {string} prompt - Raw query prompt
 * @param {string} promptType - Prompt category
 * @param {string} provider - Configured AI provider
 * @param {Object} value - Generated response payload
 * @param {number} durationMinutes - TTL in minutes
 */
export const setCachedResponse = (userId, prompt, promptType, provider, value, durationMinutes = LIMITS.DEFAULT_CACHE_DURATION_MINUTES) => {
  const key = makeKey(userId, prompt, promptType, provider);
  const expiry = Date.now() + durationMinutes * 60 * 1000;
  cache.set(key, { value, expiry });
};

/**
 * Wipes out the entire cache (triggered via admin cache clear buttons).
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Returns cache size metrics.
 */
export const getCacheSize = () => {
  // Purge expired keys first to return accurate size
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now >= entry.expiry) {
      cache.delete(key);
    }
  }
  return cache.size;
};
