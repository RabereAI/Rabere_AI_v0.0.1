#!/bin/bash

BACKUP_DIR="/backup/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/postgresql_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "Starting PostgreSQL backup..."

PGPASSWORD=$PG_PASSWORD pg_dump -h $PG_HOST -U postgres -F c -b -v -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # Cleanup old backups (keep last 7 days)
    find $BACKUP_DIR -type f -mtime +7 -name "postgresql_backup_*.sql" -delete
else
    echo "Backup failed!"
    exit 1
fi 