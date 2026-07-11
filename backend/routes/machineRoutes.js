import express from 'express';
import {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineLiveStatus,
} from '../controllers/machineController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all machine endpoints
router.use(protect);

router.get('/live-status', getMachineLiveStatus);

router
  .route('/')
  .get(getMachines)
  .post(authorize('Admin', 'Farm Owner', 'Manager'), createMachine);

router
  .route('/:id')
  .get(getMachineById)
  .put(authorize('Admin', 'Farm Owner', 'Manager'), updateMachine)
  .delete(authorize('Admin', 'Farm Owner'), deleteMachine);

export default router;
