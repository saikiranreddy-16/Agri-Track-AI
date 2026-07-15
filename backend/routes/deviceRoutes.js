import express from 'express';
import {
  activateDevice,
  replaceDevice,
  getDevices,
  getDeviceById,
  deleteDevice,
} from '../controllers/deviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Shared authenticated endpoints (Controller isolates records based on role)
router.get('/', getDevices);
router.get('/:id', getDeviceById);

// Company Admin/Admin only endpoints
router.post('/activate', authorize('Company Admin', 'Admin'), activateDevice);
router.post('/replace', authorize('Company Admin', 'Admin'), replaceDevice);
router.delete('/:id', authorize('Company Admin', 'Admin'), deleteDevice);

export default router;
