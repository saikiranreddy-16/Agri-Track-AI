import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import logger from './logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Performs dynamic binary backups using mongodump.
 * Includes backoff retry loops, logs duration metrics, and triggers rotators.
 * @param {number} retryCount - Current retry loop iteration
 * @returns {Promise<void>}
 */
export const runDatabaseBackup = async (retryCount = 0) => {
  const startTime = Date.now();
  const backupDir = path.join(__dirname, '../../', process.env.BACKUP_DIRECTORY || 'backups');
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agri-track-dev';
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(backupDir, `backup-${timestamp}.gz`);
  
  // Exclude URI parsing errors or console leakage during shell executions
  const cmd = `mongodump --uri="${mongoUri}" --archive="${archivePath}" --gzip`;
  
  logger.info('Database backup snapshot process initialized.');

  return new Promise((resolve, reject) => {
    exec(cmd, async (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      
      if (error) {
        logger.error(`Database backup snapshot failed after ${duration}ms: ${error.message}`);
        
        // Support up to 2 retry attempts
        if (retryCount < 2) {
          logger.warn(`Retrying database backup process... Attempt ${retryCount + 1}/2`);
          try {
            await runDatabaseBackup(retryCount + 1);
            return resolve();
          } catch (retryErr) {
            return reject(retryErr);
          }
        }
        return reject(error);
      }
      
      logger.info(`Database backup completed in ${duration}ms. Compressed archive: ${archivePath}`);
      
      // Purge backups exceeding retention bounds
      pruneOldBackups(backupDir);
      resolve();
    });
  });
};

/**
 * Prunes backup archives exceeding BACKUP_RETENTION_DAYS.
 */
const pruneOldBackups = (backupDir) => {
  const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS) || 7;
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
  
  fs.readdir(backupDir, (err, files) => {
    if (err) {
      logger.error(`Failed to scan backups directory for pruning: ${err.message}`);
      return;
    }
    
    const now = Date.now();
    
    files.forEach(file => {
      if (!file.endsWith('.gz')) return; // Ignore logs or other files
      
      const filePath = path.join(backupDir, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          logger.error(`Failed to stat backup file ${file}: ${statErr.message}`);
          return;
        }
        
        const fileAge = now - stats.mtimeMs;
        if (fileAge > retentionMs) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              logger.error(`Failed to prune expired backup file ${file}: ${unlinkErr.message}`);
            } else {
              logger.info(`Pruned expired database backup: ${file}`);
            }
          });
        }
      });
    });
  });
};

export default runDatabaseBackup;
