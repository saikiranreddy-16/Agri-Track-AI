import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addVehicleIncome, getProfitLossSummary } from '../controllers/incomeController.js';

const router = express.Router();

router.use(protect);

router.post('/', addVehicleIncome);
router.get('/profit-loss', getProfitLossSummary);

export default router;
