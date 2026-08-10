import express from 'express';
import {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
} from '../controllers/farmController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All farm operations require login authentication
router.use(protect);

router.route('/')
  .get(getFarms)
  .post(createFarm);

router.route('/:id')
  .get(getFarmById)
  .put(updateFarm)
  .delete(deleteFarm);

export default router;
