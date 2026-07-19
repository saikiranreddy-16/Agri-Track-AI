# Database Backup Manual – AgriTrack AI

Database backups are automated and managed via the `backupService` utility.

## 1. Automated Backups
- Runs daily via the background scheduler cron agent.
- Formats snapshots as compressed binary archives using `mongodump --gzip`.
- Retries up to 2 times on connection errors.
- Logs elapsed durations and results to `logs/combined.log`.
- Deletes archives older than `BACKUP_RETENTION_DAYS` (default: 7).

## 2. Triggering Backups Manually
To trigger a manual database backup, execute:
```bash
docker exec -it agritrack-backend node scripts/triggerBackup.js
```

## 3. Recovery Procedure
To restore a backup archive:
```bash
mongorestore --uri="<MONGO_URI>" --archive="backups/backup-timestamp.gz" --gzip
```
Or, inside the Docker container:
```bash
docker exec -i agritrack-mongo mongorestore --archive="/backups/backup-timestamp.gz" --gzip
```
