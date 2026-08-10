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
  .post(authorize('Company Admin', 'Farm Admin'), createJob);

router
  .route('/:id')
  .put(authorize('Company Admin', 'Farm Admin'), updateJob) // Realigned from Operator / Admin Owner
  .delete(authorize('Company Admin', 'Farm Admin'), deleteJob);

export default router;
