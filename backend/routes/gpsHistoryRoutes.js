import express from 'express';
import {
  getGPSHistory,
  addGPSCoordinate,
  getCurrentLocation,
  getRoutePlayback,
} from '../controllers/gpsHistoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', addGPSCoordinate);
router.get('/:machineId', getGPSHistory);
router.get('/:machineId/current', getCurrentLocation);
router.get('/:machineId/playback', getRoutePlayback);

export default router;
