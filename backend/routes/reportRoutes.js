import express from 'express';
import { getOperationsReport, exportReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getOperationsReport);
router.get('/export/:type', authorize('Company Admin'), exportReport);

export default router;
