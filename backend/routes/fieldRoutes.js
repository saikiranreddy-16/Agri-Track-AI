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
  .post(authorize('Company Admin', 'Farm Admin'), createField);

router
  .route('/:id')
  .put(authorize('Company Admin', 'Farm Admin'), updateField)
  .delete(authorize('Company Admin', 'Farm Admin'), deleteField);

export default router;
