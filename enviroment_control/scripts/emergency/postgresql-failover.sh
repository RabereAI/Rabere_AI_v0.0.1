#!/bin/bash

echo "Starting PostgreSQL failover procedure..."

# Get current primary and standby pods
PRIMARY_POD=$(kubectl get pod -l role=primary -n rabere-habitat -o jsonpath='{.items[0].metadata.name}')
STANDBY_POD=$(kubectl get pod -l role=standby -n rabere-habitat -o jsonpath='{.items[0].metadata.name}')

if [ -z "$PRIMARY_POD" ] || [ -z "$STANDBY_POD" ]; then
    echo "Error: Could not find primary or standby pods"
    exit 1
fi

echo "Current primary: $PRIMARY_POD"
echo "Current standby: $STANDBY_POD"

# Check replication status
REPLICATION_LAG=$(kubectl exec -n rabere-habitat $STANDBY_POD -- psql -U postgres -tAc "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::INT")

if [ "$REPLICATION_LAG" -gt 300 ]; then
    echo "Warning: Replication lag is high ($REPLICATION_LAG seconds)"
    read -p "Continue with failover? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Promote standby to primary
echo "Promoting standby to primary..."
kubectl exec -n rabere-habitat $STANDBY_POD -- pg_ctl promote

# Wait for promotion to complete
sleep 10

# Update labels
echo "Updating pod labels..."
kubectl label pod -n rabere-habitat $PRIMARY_POD role=standby --overwrite
kubectl label pod -n rabere-habitat $STANDBY_POD role=primary --overwrite

# Update service
echo "Updating service endpoints..."
kubectl patch svc postgresql -n rabere-habitat -p "{\"spec\":{\"selector\":{\"role\":\"primary\"}}}"

# Verify new primary
echo "Verifying new primary..."
kubectl exec -n rabere-habitat $STANDBY_POD -- psql -U postgres -tAc "SELECT pg_is_in_recovery()"

echo "Failover completed. New primary is $STANDBY_POD" 