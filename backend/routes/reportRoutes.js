import express from 'express';
import { getOperationsReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getOperationsReport);

export default router;
