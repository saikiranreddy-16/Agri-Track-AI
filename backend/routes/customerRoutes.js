import express from 'express';
import {
  getCustomers,
  resetCustomerPassword,
  resetTrustedDevices,
  deleteCustomer,
  requestMobileChange,
  getMobileChangeRequests,
  approveMobileChange,
  rejectMobileChange,
  getCustomerDetails,
  getCustomerVehicles,
  getCustomerFarms,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Farm Admin only endpoints
router.post('/mobile-change-request', requestMobileChange);

// Company Admin only endpoints
router.get('/', authorize('Company Admin'), getCustomers);
router.get('/:id', authorize('Company Admin'), getCustomerDetails);
router.get('/:id/vehicles', authorize('Company Admin'), getCustomerVehicles);
router.get('/:id/farms', authorize('Company Admin'), getCustomerFarms);
router.delete('/:id', authorize('Company Admin'), deleteCustomer);
router.post('/:id/reset-password', authorize('Company Admin'), resetCustomerPassword);
router.post('/:id/reset-trusted', authorize('Company Admin'), resetTrustedDevices);
router.get('/mobile-change-requests', authorize('Company Admin'), getMobileChangeRequests);
router.post('/mobile-change-requests/:id/approve', authorize('Company Admin'), approveMobileChange);
router.post('/mobile-change-requests/:id/reject', authorize('Company Admin'), rejectMobileChange);

export default router;
