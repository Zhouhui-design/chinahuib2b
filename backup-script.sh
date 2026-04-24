#!/bin/bash
# Daily backup of database

BACKUP_DIR="/backups/chinahuib2b"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="chinahuib2b"
DB_USER="expo_user"
DB_PASS="CHANGE_THIS_PASSWORD"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
PGPASSWORD=$DB_PASS pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Keep last 30 days of backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
