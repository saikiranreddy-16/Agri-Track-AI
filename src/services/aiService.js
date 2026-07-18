import api from '../utils/api';

/**
 * Sends a chat query to the backend AI module.
 * @param {string} prompt - User question or query.
 * @returns {Promise<Object>} Backend standard response.
 */
export const chat = async (prompt) => {
  const response = await api.post('/ai/chat', { prompt });
  return response.data;
};

/**
 * Fetches daily operational report from backend AI.
 * @returns {Promise<Object>} Backend standard response.
 */
export const getDailyReport = async () => {
  const response = await api.post('/ai/report', { type: 'daily' });
  return response.data;
};

/**
 * Fetches weekly fleet report from backend AI.
 * @returns {Promise<Object>} Backend standard response.
 */
export const getWeeklyReport = async () => {
  const response = await api.post('/ai/report', { type: 'weekly' });
  return response.data;
};

/**
 * Triggers a fuel diagnostics/consumption analysis.
 * @returns {Promise<Object>} Backend standard response.
 */
export const analyzeFuel = async () => {
  const response = await api.post('/ai/analysis', { type: 'fuel' });
  return response.data;
};

/**
 * Summarizes the status of a specific machinery asset.
 * @param {string} machineId - Target machine identifier.
 * @returns {Promise<Object>} Backend standard response.
 */
export const summarizeMachine = async (machineId) => {
  const response = await api.post('/ai/summary', { type: 'machine', machineId });
  return response.data;
};
