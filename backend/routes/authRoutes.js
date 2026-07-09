import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
} from '../validators/authValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define authentication routes mapped to validation and controllers
router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getUserProfile);

export default router;
