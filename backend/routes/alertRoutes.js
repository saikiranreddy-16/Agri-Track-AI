import express from 'express';
import { getAlerts, resolveAlert } from '../controllers/alertController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.put('/:id/resolve', authorize('Company Admin', 'Farm Admin'), resolveAlert);

export default router;
