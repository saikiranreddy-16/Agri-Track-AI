import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addDieselExpense,
  getDieselExpenses,
  addServiceExpense,
  getServiceExpenses,
  addOperatingExpense,
  getOperatingExpenses,
} from '../controllers/expenseController.js';

const router = express.Router();

router.use(protect);

router.post('/diesel', addDieselExpense);
router.get('/diesel', getDieselExpenses);

router.post('/service', addServiceExpense);
router.get('/service', getServiceExpenses);

router.post('/operating', addOperatingExpense);
router.get('/operating', getOperatingExpenses);

export default router;
