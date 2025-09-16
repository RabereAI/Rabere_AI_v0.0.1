#!/bin/bash

echo "Starting MongoDB failover procedure..."

# Connect to MongoDB replica set
MONGO_URI="mongodb://$MONGODB_USER:$MONGODB_PASSWORD@$MONGODB_HOST:$MONGODB_PORT/admin?replicaSet=rabies-rs"

# Get current replica set status
RS_STATUS=$(mongosh --quiet --eval "rs.status()" "$MONGO_URI")
PRIMARY=$(echo "$RS_STATUS" | grep "PRIMARY" -B2 | grep "name" | cut -d'"' -f4)
SECONDARY=$(echo "$RS_STATUS" | grep "SECONDARY" -B2 | grep "name" | cut -d'"' -f4)

if [ -z "$PRIMARY" ] || [ -z "$SECONDARY" ]; then
    echo "Error: Could not determine primary or secondary nodes"
    exit 1
fi

echo "Current primary: $PRIMARY"
echo "Current secondary: $SECONDARY"

# Check replication lag
REPLICATION_LAG=$(mongosh --quiet --eval "
    primary = db.isMaster().primary;
    secondary = db.isMaster().hosts.find(h => h !== primary);
    rst = rs.status();
    primaryTime = rst.members.find(m => m.name === primary).optime.ts;
    secondaryTime = rst.members.find(m => m.name === secondary).optime.ts;
    lag = Math.abs(primaryTime.getTime() - secondaryTime.getTime()) / 1000;
    print(lag);
" "$MONGO_URI")

if [ "$REPLICATION_LAG" -gt 300 ]; then
    echo "Warning: Replication lag is high ($REPLICATION_LAG seconds)"
    read -p "Continue with failover? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Initiate stepdown of current primary
echo "Stepping down current primary..."
mongosh --quiet --eval "rs.stepDown()" "$MONGO_URI"

# Wait for new primary election
sleep 10

# Verify new configuration
NEW_PRIMARY=$(mongosh --quiet --eval "rs.status()" "$MONGO_URI" | grep "PRIMARY" -B2 | grep "name" | cut -d'"' -f4)
echo "Failover completed. New primary is $NEW_PRIMARY"

# Update connection strings if needed
kubectl get configmap -n rabies-detection -o yaml | sed "s/$PRIMARY/$NEW_PRIMARY/g" | kubectl apply -f - 