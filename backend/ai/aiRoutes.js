import express from 'express';
import {
  chat,
  report,
  analysis,
  summary,
  health
} from './aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';
import { aiErrorHandler } from '../middleware/aiErrorHandler.js';

const router = express.Router();

// AI Health endpoint is public for easy container healthchecks
router.get('/health', health);

// Protect operational endpoints
router.use(protect);
router.use(aiRateLimiter);

router.post('/chat', chat);
router.post('/report', report);
router.post('/analysis', analysis);
router.post('/summary', summary);

// AI module specific error handler
router.use(aiErrorHandler);

export default router;
