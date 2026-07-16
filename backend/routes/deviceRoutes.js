import express from 'express';
import {
  activateDevice,
  replaceDevice,
  getDevices,
  getDeviceById,
  deleteDevice,
  getReplacementHistory,
} from '../controllers/deviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { activateValidator, replaceValidator } from '../validators/deviceValidator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

// Shared authenticated endpoints (Controller isolates records based on role)
router.get('/', getDevices);
router.get('/replacement-history', authorize('Company Admin'), getReplacementHistory);
router.get('/:id', getDeviceById);

// Company Admin only endpoints
router.post('/activate', authorize('Company Admin'), authRateLimiter({ max: 10 }), activateValidator, activateDevice);
router.post('/replace', authorize('Company Admin'), authRateLimiter({ max: 10 }), replaceValidator, replaceDevice);
router.delete('/:id', authorize('Company Admin'), deleteDevice);

export default router;
