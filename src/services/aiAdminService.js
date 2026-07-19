import api from '../utils/api';

/**
 * Retrieves dynamic AI settings.
 * @returns {Promise<Object>}
 */
export const getSettings = async () => {
  const response = await api.get('/ai-admin/settings');
  return response.data;
};

/**
 * Retrieves AI provider status and latency health checks.
 * @returns {Promise<Object>}
 */
export const getStatus = async () => {
  const response = await api.get('/ai-admin/status');
  return response.data;
};

/**
 * Retrieves global AI metrics (cache hit counters, rolling average latencies).
 * @returns {Promise<Object>}
 */
export const getMetrics = async () => {
  const response = await api.get('/ai-admin/metrics');
  return response.data;
};

/**
 * Retrieves overall system AI usage statistics per user.
 * @returns {Promise<Object>}
 */
export const getUsage = async () => {
  const response = await api.get('/ai-admin/usage');
  return response.data;
};

/**
 * Submits configuration updates to MongoDB setting records.
 * @param {Object} settings - Object containing provider parameters
 * @returns {Promise<Object>}
 */
export const changeProvider = async (settings) => {
  const response = await api.post('/ai-admin/provider', settings);
  return response.data;
};

/**
 * Flushes the in-memory AI cache.
 * @returns {Promise<Object>}
 */
export const clearAICache = async () => {
  const response = await api.post('/ai-admin/cache/clear');
  return response.data;
};
