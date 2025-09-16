-- Create keyspace
CREATE KEYSPACE IF NOT EXISTS rabere_detection
WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'datacenter1': 3
};

-- Use keyspace
USE rabere_detection;

-- Create tables
CREATE TABLE IF NOT EXISTS raw_telemetry (
    device_id uuid,
    timestamp timestamp,
    animal_type text,
    behavior_score decimal,
    aggression_level decimal,
    movement_pattern text,
    hydrophobia_detected boolean,
    alert_level text,
    video_reference text,
    location text,
    PRIMARY KEY ((device_id), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);

CREATE TABLE IF NOT EXISTS device_metrics (
    device_id uuid,
    date date,
    hour int,
    avg_behavior_score decimal,
    avg_aggression_level decimal,
    symptom_count counter,
    alert_count counter,
    PRIMARY KEY ((device_id, date), hour)
) WITH CLUSTERING ORDER BY (hour ASC);

CREATE TABLE IF NOT EXISTS device_alerts (
    device_id uuid,
    alert_id timeuuid,
    alert_type text,
    severity text,
    message text,
    created_at timestamp,
    resolved_at timestamp,
    resolved boolean,
    PRIMARY KEY ((device_id), alert_id)
) WITH CLUSTERING ORDER BY (alert_id DESC);

CREATE TABLE IF NOT EXISTS device_maintenance (
    device_id uuid,
    maintenance_id timeuuid,
    maintenance_type text,
    description text,
    performed_by text,
    performed_at timestamp,
    PRIMARY KEY ((device_id), maintenance_id)
) WITH CLUSTERING ORDER BY (maintenance_id DESC);

-- Create materialized views
CREATE MATERIALIZED VIEW IF NOT EXISTS alerts_by_severity AS
SELECT *
FROM device_alerts
WHERE device_id IS NOT NULL
    AND alert_id IS NOT NULL
    AND severity IS NOT NULL
PRIMARY KEY ((severity), alert_id, device_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS maintenance_by_type AS
SELECT *
FROM device_maintenance
WHERE device_id IS NOT NULL
    AND maintenance_id IS NOT NULL
    AND maintenance_type IS NOT NULL
PRIMARY KEY ((maintenance_type), maintenance_id, device_id);

-- Create secondary indexes
CREATE INDEX IF NOT EXISTS ON raw_telemetry (behavior_score);
CREATE INDEX IF NOT EXISTS ON raw_telemetry (aggression_level);
CREATE INDEX IF NOT EXISTS ON raw_telemetry (hydrophobia_detected);
CREATE INDEX IF NOT EXISTS ON device_alerts (resolved);
CREATE INDEX IF NOT EXISTS ON device_alerts (created_at);

-- Create user roles
CREATE ROLE IF NOT EXISTS rabere_detection_reader
WITH PASSWORD = 'reader_password'
AND LOGIN = true
AND SUPERUSER = false;

CREATE ROLE IF NOT EXISTS rabere_detection_writer
WITH PASSWORD = 'writer_password'
AND LOGIN = true
AND SUPERUSER = false;

-- Grant permissions
GRANT SELECT ON KEYSPACE rabere_detection TO rabere_detection_reader;
GRANT ALL PERMISSIONS ON KEYSPACE rabere_detection TO rabere_detection_writer; 