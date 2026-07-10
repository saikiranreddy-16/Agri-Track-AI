import express from 'express';
import {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driverController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getDrivers)
  .post(authorize('Admin', 'Farm Owner', 'Manager'), createDriver);

router
  .route('/:id')
  .get(getDriverById)
  .put(authorize('Admin', 'Farm Owner', 'Manager'), updateDriver)
  .delete(authorize('Admin', 'Farm Owner'), deleteDriver);

export default router;
