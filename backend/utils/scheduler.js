import { runDatabaseBackup } from './backupService.js';
import logger from './logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let intervals = [];

/**
 * Initializes system crons and background jobs.
 */
export const startScheduler = () => {
  logger.info('Background scheduler started successfully.');

  // Run database backup snapshot every 24 hours
  const backupTimer = setInterval(async () => {
    try {
      await runDatabaseBackup();
    } catch (err) {
      logger.error(`Scheduled database backup snapshot failed: ${err.message}`);
    }
  }, 24 * 60 * 60 * 1000);
  
  intervals.push(backupTimer);

  // Clean log directory files older than 14 days every 12 hours
  const logCleanupTimer = setInterval(() => {
    try {
      pruneOldLogs();
    } catch (err) {
      logger.error(`Scheduled log pruner job failed: ${err.message}`);
    }
  }, 12 * 60 * 60 * 1000);
  
  intervals.push(logCleanupTimer);
};

/**
 * Clears interval timers to facilitate sequential graceful process terminations.
 */
export const stopScheduler = () => {
  logger.info('Scheduler timers stopping...');
  intervals.forEach(clearInterval);
  intervals = [];
  logger.info('Scheduler timers stopped.');
};

/**
 * Sweeps logs folder deleting files older than 14 days.
 */
const pruneOldLogs = () => {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) return;

  fs.readdir(logDir, (err, files) => {
    if (err) {
      logger.error(`Failed to scan logs directory for pruner: ${err.message}`);
      return;
    }

    const now = Date.now();
    const maxLogAgeMs = 14 * 24 * 60 * 60 * 1000; // 14 days

    files.forEach(file => {
      const filePath = path.join(logDir, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) return;
        
        if (now - stats.mtimeMs > maxLogAgeMs) {
          fs.unlink(filePath, (unlinkErr) => {
            if (!unlinkErr) {
              logger.info(`Scheduler deleted expired logs: ${file}`);
            }
          });
        }
      });
    });
  });
};

export default startScheduler;
