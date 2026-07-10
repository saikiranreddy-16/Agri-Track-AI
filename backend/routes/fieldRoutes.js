import express from 'express';
import {
  getFields,
  createField,
  updateField,
  deleteField,
} from '../controllers/fieldController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getFields)
  .post(authorize('Admin', 'Farm Owner', 'Manager'), createField);

router
  .route('/:id')
  .put(authorize('Admin', 'Farm Owner', 'Manager'), updateField)
  .delete(authorize('Admin', 'Farm Owner'), deleteField);

export default router;
