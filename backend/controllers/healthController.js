import mongoose from 'mongoose';
import os from 'os';
import { getAIConfig } from '../config/aiConfig.js';
import { getCacheSize } from '../ai/cacheService.js';
import { getAllHealthStats } from '../ai/providerHealth.js';
import logger from '../utils/logger.js';

// Load package version
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let packageVersion = '1.0.0';
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
  );
  packageVersion = packageJson.version || '1.0.0';
} catch (e) {
  // Ignore
}

// 1. GET /health (Liveness)
export const getLiveness = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

// 2. GET /ready (Readiness - kubernetes liveness checks)
export const getReadiness = async (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  
  if (!dbConnected) {
    return res.status(503).json({
      success: false,
      status: 'unready',
      reason: 'Database connection offline',
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    success: true,
    status: 'ready',
    timestamp: new Date().toISOString()
  });
};

// 3. GET /health/db (MongoDB detailed status)
export const getDbHealth = async (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const status = states[readyState] || 'unknown';
  const isHealthy = readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status,
    dbName: mongoose.connection.name,
    timestamp: new Date().toISOString()
  });
};

// 4. GET /health/ai (Configured provider status and last diagnostics)
export const getAiHealth = (req, res) => {
  const config = getAIConfig();
  const providerStats = getAllHealthStats();

  res.status(200).json({
    success: true,
    configuredProvider: config.provider,
    model: config.model,
    diagnostics: providerStats,
    timestamp: new Date().toISOString()
  });
};

// 5. GET /health/cache (In-memory cache metrics)
export const getCacheHealth = (req, res) => {
  res.status(200).json({
    success: true,
    cacheEnabled: process.env.ENABLE_CACHE !== 'false',
    totalCachedKeys: getCacheSize(),
    timestamp: new Date().toISOString()
  });
};

// 6. GET /health/system (System load/Memory pings)
export const getSystemHealth = (req, res) => {
  res.status(200).json({
    success: true,
    platform: process.platform,
    arch: process.arch,
    cores: os.cpus().length,
    freeMemory: Math.round(os.freemem() / (1024 * 1024)) + ' MB',
    totalMemory: Math.round(os.totalmem() / (1024 * 1024)) + ' MB',
    processMemory: Math.round(process.memoryUsage().rss / (1024 * 1024)) + ' MB',
    cpuLoad: os.loadavg(),
    timestamp: new Date().toISOString()
  });
};

// 7. GET /version (Version and environment context)
export const getVersion = (req, res) => {
  res.status(200).json({
    success: true,
    version: packageVersion,
    environment: process.env.NODE_ENV || 'development',
    buildTime: new Date().toISOString(),
    gitCommit: process.env.GIT_COMMIT || 'development'
  });
};

// 8. GET /metrics (Prometheus integration placeholder)
export const getMetrics = (req, res) => {
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const uptime = process.uptime();

  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP agritrack_free_memory Free system memory in bytes
# TYPE agritrack_free_memory gauge
agritrack_free_memory ${freeMem}

# HELP agritrack_total_memory Total system memory in bytes
# TYPE agritrack_total_memory gauge
agritrack_total_memory ${totalMem}

# HELP agritrack_process_uptime Node process uptime in seconds
# TYPE agritrack_process_uptime counter
agritrack_process_uptime ${uptime}
  `.trim());
};

// 9. POST /log/frontend (React boundary logger)
export const logFrontendCrash = (req, res) => {
  const { errorMsg, componentStack, locationUrl } = req.body;
  
  logger.error(
    `FRONTEND CRASH ALERT at ${locationUrl || 'Unknown URL'}: ${errorMsg || 'No Message'}\nStack: ${componentStack || 'No stack trace provided'}`
  );

  res.status(250).json({
    success: true,
    message: 'Frontend crash logged successfully'
  });
};
