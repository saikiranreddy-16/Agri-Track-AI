import express from 'express';
import {
  getCustomers,
  resetCustomerPassword,
  resetTrustedDevices,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Company Admin', 'Admin'));

router.get('/', getCustomers);
router.post('/:id/reset-password', resetCustomerPassword);
router.post('/:id/reset-trusted', resetTrustedDevices);

export default router;
