import express from 'express';
import { queryAI } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// AI routes are protected and verify users through standard token validation
router.post('/query', protect, queryAI);

export default router;
