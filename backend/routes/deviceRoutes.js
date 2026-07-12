import express from 'express';
import { activateDevice, replaceDevice } from '../controllers/deviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both operations require login and Company Admin authority
router.use(protect);
router.use(authorize('Company Admin', 'Admin'));

router.post('/activate', activateDevice);
router.post('/replace', replaceDevice);

export default router;
