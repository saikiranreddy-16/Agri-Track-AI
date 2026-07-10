import express from 'express';
import { getGPSHistory, addGPSCoordinate } from '../controllers/gpsHistoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', addGPSCoordinate);
router.get('/:machineId', getGPSHistory);

export default router;
