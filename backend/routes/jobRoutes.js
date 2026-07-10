import express from 'express';
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getJobs)
  .post(authorize('Admin', 'Farm Owner', 'Manager'), createJob);

router
  .route('/:id')
  .put(protect, updateJob) // Allows operator to update progress as well
  .delete(authorize('Admin', 'Farm Owner'), deleteJob);

export default router;
