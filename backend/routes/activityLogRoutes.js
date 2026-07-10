import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'Farm Owner'), getActivityLogs);

export default router;
