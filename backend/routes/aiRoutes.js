import express from 'express';
import {
  queryAI,
  chatAI,
  getChatHistory,
  clearChatHistory,
  submitFeedback,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/query', queryAI);
router.post('/chat', chatAI);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);
router.post('/feedback', submitFeedback);

export default router;
