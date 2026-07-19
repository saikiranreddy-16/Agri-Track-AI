import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import { loadAIConfigFromDB } from './config/aiConfig.js';
import { initSocket } from './services/socketService.js';
import { startGPSSimulator } from './services/gpsSimulator.js';
import { startHeartbeatMonitor } from './services/heartbeatMonitor.js';
import { startScheduler, stopScheduler } from './utils/scheduler.js';
import logger from './utils/logger.js';

// Load environment variables from .env file
dotenv.config();

// === STARTUP ENVIRONMENT VALIDATION ===
const requiredEnvKeys = ['MONGO_URI', 'JWT_SECRET'];
const missingKeys = requiredEnvKeys.filter(key => !process.env[key]);
if (missingKeys.length > 0) {
  logger.error(`CRITICAL BOOTUP FAILURE: Missing required environment variables: ${missingKeys.join(', ')}`);
  process.exit(1);
}

// Connect to MongoDB & load AI config
connectDB().then(() => {
  loadAIConfigFromDB();
});

const PORT = process.env.PORT || process.env.APP_PORT || 5000;

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start HTTP server listening
server.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  // Start simulated machinery movement timer
  startGPSSimulator();
  // Start heartbeat monitoring checks
  startHeartbeatMonitor();
  // Start automated schedulers (backups and log rotations)
  startScheduler();
});

// === GRACEFUL SHUTDOWN SEQUENCES ===
const gracefulShutdown = (signal) => {
  logger.warn(`Process received signal: ${signal}. Commencing sequential graceful shutdown.`);
  
  // 1. Stop cron scheduler tasks
  stopScheduler();

  // 2. Stop HTTP server from accepting new requests
  server.close(async () => {
    logger.info('HTTP server has closed and stopped accepting requests.');
    
    try {
      // 3. Disconnect from database
      await mongoose.disconnect();
      logger.info('MongoDB disconnected safely.');
      
      logger.info('Graceful shutdown completed successfully. Exiting.');
      process.exit(0);
    } catch (err) {
      logger.error(`Error during MongoDB disconnection: ${err.message}`);
      process.exit(1);
    }
  });

  // Enforce a hard timeout limit of 10 seconds for graceful shutdown
  setTimeout(() => {
    logger.error('Could not complete graceful shutdown in time. Forcing termination.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections (e.g. database connection errors)
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
