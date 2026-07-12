import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  changePIN,
  removeTrustedDevice,
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
} from '../validators/authValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getUserProfile);
router.put('/change-pin', protect, changePIN);
router.delete('/trusted-devices/:deviceId', protect, removeTrustedDevice);

export default router;
