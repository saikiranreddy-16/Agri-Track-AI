import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTripReplayData } from '../controllers/tripReplayController.js';

const router = express.Router();

router.use(protect);

router.get('/:machineId', getTripReplayData);

export default router;
