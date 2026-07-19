import api from '../utils/api';

/**
 * Creates a new stateful AI conversation.
 * @param {string} title - Optional title of the conversation.
 * @returns {Promise<Object>} Backend response.
 */
export const createConversation = async (title = 'New Conversation') => {
  const response = await api.post('/ai/conversation', { title });
  return response.data;
};

/**
 * Continues a conversation by sending a prompt.
 * @param {string} id - Conversation ID.
 * @param {string} prompt - User message.
 * @returns {Promise<Object>} Backend standard response containing AI generated response text.
 */
export const sendMessage = async (id, prompt) => {
  const response = await api.post(`/ai/conversation/${id}/chat`, { prompt });
  return response.data;
};

/**
 * Retrieves the details of a single conversation session.
 * @param {string} id - Conversation ID.
 * @returns {Promise<Object>} Backend response containing conversation document and messages list.
 */
export const getConversation = async (id) => {
  const response = await api.get(`/ai/conversation/${id}`);
  return response.data;
};

/**
 * Retrieves a list of active conversation sessions for the current logged-in user.
 * @returns {Promise<Object>} Backend response containing array of conversations.
 */
export const getConversationList = async () => {
  const response = await api.get('/ai/conversation');
  return response.data;
};

/**
 * Renames a conversation title.
 * @param {string} id - Conversation ID.
 * @param {string} title - New title text.
 * @returns {Promise<Object>} Backend response.
 */
export const renameConversation = async (id, title) => {
  const response = await api.put(`/ai/conversation/${id}`, { title });
  return response.data;
};

/**
 * Archives a conversation session.
 * @param {string} id - Conversation ID.
 * @returns {Promise<Object>} Backend response.
 */
export const archiveConversation = async (id) => {
  const response = await api.patch(`/ai/conversation/${id}/archive`);
  return response.data;
};

/**
 * Soft deletes a conversation session.
 * @param {string} id - Conversation ID.
 * @returns {Promise<Object>} Backend response.
 */
export const deleteConversation = async (id) => {
  const response = await api.delete(`/ai/conversation/${id}`);
  return response.data;
};

/**
 * Clears all message history in a conversation session.
 * @param {string} id - Conversation ID.
 * @returns {Promise<Object>} Backend response.
 */
export const clearConversation = async (id) => {
  const response = await api.delete(`/ai/conversation/${id}/messages`);
  return response.data;
};

/**
 * Submits feedback on a conversation (Like/Dislike).
 * @param {string} id - Conversation ID.
 * @param {string} feedback - 'Like' or 'Dislike' or null.
 * @returns {Promise<Object>} Backend response.
 */
export const submitFeedback = async (id, feedback) => {
  const response = await api.post(`/ai/conversation/${id}/feedback`, { feedback });
  return response.data;
};
