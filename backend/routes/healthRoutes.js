import express from 'express';
import {
  getLiveness,
  getDbHealth,
  getAiHealth,
  getCacheHealth,
  getSystemHealth
} from '../controllers/healthController.js';

const router = express.Router();

// Mount `/api/v1/health` subroutes
router.get('/', getLiveness);
router.get('/db', getDbHealth);
router.get('/ai', getAiHealth);
router.get('/cache', getCacheHealth);
router.get('/system', getSystemHealth);

export default router;
