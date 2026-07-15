import express from 'express';
import {
  hardwareGPSUpload,
  hardwareHeartbeat,
  hardwareFirmwareCheck,
  hardwareDiagnostics,
} from '../controllers/hardwareController.js';

const router = express.Router();

// Direct hardware unit posts (no JWT cookie auth required, uses deviceId matching in collection)
router.post('/gps-upload', hardwareGPSUpload);
router.post('/heartbeat', hardwareHeartbeat);
router.get('/firmware-update', hardwareFirmwareCheck);
router.post('/diagnostics', hardwareDiagnostics);

export default router;
