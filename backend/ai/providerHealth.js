import providerManager from './providerManager.js';

const startTimestamp = Date.now();

// In-memory status store for healthchecks
const healthStats = {
  mock: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalResponseTime: 0, lastResponseTime: 0 },
  gemini: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalResponseTime: 0, lastResponseTime: 0 },
  openai: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalResponseTime: 0, lastResponseTime: 0 },
  ollama: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalResponseTime: 0, lastResponseTime: 0 },
  huggingface: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalResponseTime: 0, lastResponseTime: 0 }
};

/**
 * Log response details.
 */
export const logHealthStats = (providerName, responseTime, isSuccess) => {
  const providerKey = providerName?.toLowerCase();
  const stats = healthStats[providerKey] || healthStats.mock;

  stats.totalRequests++;
  if (isSuccess) {
    stats.successfulRequests++;
  } else {
    stats.failedRequests++;
  }
  stats.totalResponseTime += responseTime;
  stats.lastResponseTime = responseTime;
};

/**
 * Compiles in-memory health metrics for a provider.
 */
export const getProviderHealth = async (providerName) => {
  const providerKey = providerName.toLowerCase();
  const stats = healthStats[providerKey] || { totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalResponseTime: 0, lastResponseTime: 0 };
  
  const avgResponseTime = stats.totalRequests > 0 
    ? Math.round(stats.totalResponseTime / stats.totalRequests) 
    : 0;

  // Perform a ping connection test
  let isConnected = true;
  try {
    isConnected = await providerManager.checkHealth(providerKey);
  } catch (err) {
    isConnected = false;
  }

  let status = 'healthy';
  if (!isConnected) {
    status = 'offline';
  } else if (stats.failedRequests > 0 && stats.successfulRequests === 0) {
    status = 'degraded';
  }

  return {
    provider: providerName,
    status,
    latency: stats.lastResponseTime,
    avgResponseTime,
    uptime: Math.round((Date.now() - startTimestamp) / 1000), // in seconds
    totalRequests: stats.totalRequests,
    successfulRequests: stats.successfulRequests,
    failedRequests: stats.failedRequests
  };
};

/**
 * Returns raw stats map for admin dashboards.
 */
export const getAllHealthStats = () => {
  const formatted = {};
  for (const [key, val] of Object.entries(healthStats)) {
    const avgResponseTime = val.totalRequests > 0 ? Math.round(val.totalResponseTime / val.totalRequests) : 0;
    formatted[key] = {
      ...val,
      avgResponseTime
    };
  }
  return formatted;
};
export default getProviderHealth;
