#!/bin/bash

BACKUP_DIR="/backup/cassandra"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_NAME="backup_$TIMESTAMP"

mkdir -p $BACKUP_DIR

echo "Starting Cassandra backup..."

# Create snapshot
nodetool snapshot -t $SNAPSHOT_NAME rabies_detection

if [ $? -eq 0 ]; then
    echo "Snapshot created successfully"
    
    # Find and compress snapshot files
    find /var/lib/cassandra/data/rabies_detection -name "$SNAPSHOT_NAME" -type d | while read snapshot_dir; do
        keyspace_dir=$(echo "$snapshot_dir" | awk -F'/rabies_detection/' '{print $2}' | cut -d'/' -f1)
        backup_path="$BACKUP_DIR/${keyspace_dir}_${TIMESTAMP}.tar.gz"
        
        tar -czf "$backup_path" -C "$(dirname "$snapshot_dir")" "$(basename "$snapshot_dir")"
    done
    
    # Cleanup snapshot
    nodetool clearsnapshot -t $SNAPSHOT_NAME rabies_detection
    
    # Cleanup old backups (keep last 7 days)
    find $BACKUP_DIR -type f -mtime +7 -name "*.tar.gz" -delete
    
    echo "Backup completed successfully"
else
    echo "Backup failed!"
    exit 1
fi 