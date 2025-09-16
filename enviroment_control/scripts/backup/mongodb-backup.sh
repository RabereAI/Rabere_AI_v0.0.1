#!/bin/bash

BACKUP_DIR="/backup/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$TIMESTAMP"

mkdir -p $BACKUP_DIR

echo "Starting MongoDB backup..."

mongodump --host $MONGODB_HOST --port $MONGODB_PORT \
          --username $MONGODB_USER --password $MONGODB_PASSWORD \
          --authenticationDatabase admin \
          --db rabies_detection \
          --out $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # Compress backup
    tar -czf "$BACKUP_FILE.tar.gz" -C $BACKUP_DIR "mongodb_backup_$TIMESTAMP"
    rm -rf $BACKUP_FILE
    
    # Cleanup old backups (keep last 7 days)
    find $BACKUP_DIR -type f -mtime +7 -name "mongodb_backup_*.tar.gz" -delete
else
    echo "Backup failed!"
    exit 1
fi 