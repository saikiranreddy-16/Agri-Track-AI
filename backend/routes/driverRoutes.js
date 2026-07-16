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
  .post(authorize('Company Admin', 'Farm Admin'), createDriver);

router
  .route('/:id')
  .get(getDriverById)
  .put(authorize('Company Admin', 'Farm Admin'), updateDriver)
  .delete(authorize('Company Admin', 'Farm Admin'), deleteDriver);

export default router;
