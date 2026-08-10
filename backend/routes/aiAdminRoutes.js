import express from 'express';
import {
  getSettings,
  getStatus,
  getUsage,
  getMetrics,
  changeProvider,
  clearAICache
} from '../controllers/aiAdminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Restrict all routes under this file to Company Admin only
router.use(protect);
router.use(authorize('Company Admin'));

router.get('/settings', getSettings);
router.get('/status', getStatus);
router.get('/usage', getUsage);
router.get('/metrics', getMetrics);
router.post('/provider', changeProvider);
router.post('/cache/clear', clearAICache);

export default router;
