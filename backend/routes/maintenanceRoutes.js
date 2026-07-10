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
  .post(authorize('Admin', 'Farm Owner', 'Manager', 'Mechanic'), createMaintenanceRecord);

router
  .route('/:id')
  .put(authorize('Admin', 'Farm Owner', 'Manager', 'Mechanic'), updateMaintenanceRecord)
  .delete(authorize('Admin', 'Farm Owner'), deleteMaintenanceRecord);

export default router;
