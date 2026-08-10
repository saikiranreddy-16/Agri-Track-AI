import express from 'express';
import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getMaintenanceRecords)
  .post(authorize('Company Admin', 'Farm Admin'), createMaintenanceRecord);

router
  .route('/:id')
  .put(authorize('Company Admin', 'Farm Admin'), updateMaintenanceRecord)
  .delete(authorize('Company Admin', 'Farm Admin'), deleteMaintenanceRecord);

export default router;
