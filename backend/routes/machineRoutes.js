import express from 'express';
import {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineLiveStatus,
  getVehicleMetadata,
} from '../controllers/machineController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all machine endpoints
router.use(protect);

router.get('/live-status', getMachineLiveStatus);
router.get('/vehicle-metadata', getVehicleMetadata);

router
  .route('/')
  .get(getMachines)
  .post(authorize('Company Admin', 'Farm Admin'), createMachine);

router
  .route('/:id')
  .get(getMachineById)
  .put(authorize('Company Admin', 'Farm Admin'), updateMachine)
  .delete(authorize('Company Admin', 'Farm Admin'), deleteMachine);

export default router;
