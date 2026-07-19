import express from 'express';
import {
  createConversation,
  continueConversation,
  getConversations,
  getConversation,
  renameConversation,
  deleteConversation,
  archiveConversation,
  clearConversation,
  submitFeedback,
  health
} from './aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';
import { validateAIRequest } from '../middleware/aiMiddleware.js';
import { aiErrorHandler } from './errorHandler.js';

const router = express.Router();

// Public health check route
router.get('/health', health);

// Protected routes
router.use(protect);
router.use(aiRateLimiter);
router.use(validateAIRequest);

router.post('/conversation', createConversation);
router.post('/conversation/:id/chat', continueConversation);
router.get('/conversation', getConversations);
router.get('/conversation/:id', getConversation);
router.put('/conversation/:id', renameConversation);
router.delete('/conversation/:id', deleteConversation);
router.patch('/conversation/:id/archive', archiveConversation);
router.delete('/conversation/:id/messages', clearConversation);
router.post('/conversation/:id/feedback', submitFeedback);

// Custom AI error handler
router.use(aiErrorHandler);

export default router;
