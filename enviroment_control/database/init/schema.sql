-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- Create schema
CREATE SCHEMA rabere_detection;

-- Create telemetry table
CREATE TABLE rabere_detection.telemetry (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id uuid NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    behavior_score DECIMAL(5,2) NOT NULL,
    aggression_level DECIMAL(5,2) NOT NULL,
    movement_pattern VARCHAR(50) NOT NULL,
    hydrophobia_detected BOOLEAN NOT NULL,
    alert_level VARCHAR(20) NOT NULL,
    video_reference TEXT,
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert to hypertable
SELECT create_hypertable('rabere_detection.telemetry', 'timestamp');

-- Create devices table
CREATE TABLE rabere_detection.devices (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    mac_address MACADDR NOT NULL,
    firmware_version VARCHAR(50) NOT NULL,
    camera_resolution VARCHAR(20) NOT NULL,
    camera_fps INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE rabere_detection.alerts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id uuid NOT NULL REFERENCES rabere_detection.devices(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    CONSTRAINT valid_severity CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL'))
);

-- Create maintenance log table
CREATE TABLE rabere_detection.maintenance_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id uuid NOT NULL REFERENCES rabere_detection.devices(id),
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calibration history table
CREATE TABLE rabere_detection.calibration_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id uuid NOT NULL REFERENCES rabere_detection.devices(id),
    temperature_offset DECIMAL(4,2) NOT NULL,
    humidity_offset DECIMAL(4,2) NOT NULL,
    calibrated_by VARCHAR(255) NOT NULL,
    calibrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_telemetry_device_id ON rabere_detection.telemetry(device_id);
CREATE INDEX idx_telemetry_timestamp ON rabere_detection.telemetry(timestamp DESC);
CREATE INDEX idx_alerts_device_id ON rabere_detection.alerts(device_id);
CREATE INDEX idx_alerts_created_at ON rabere_detection.alerts(created_at DESC);
CREATE INDEX idx_maintenance_device_id ON rabere_detection.maintenance_log(device_id);
CREATE INDEX idx_calibration_device_id ON rabere_detection.calibration_history(device_id);

-- Create views
CREATE VIEW rabere_detection.device_status AS
SELECT 
    d.id,
    d.name,
    d.location,
    t.behavior_score,
    t.aggression_level,
    t.movement_pattern,
    t.hydrophobia_detected,
    t.alert_level,
    t.timestamp as last_update
FROM rabere_detection.devices d
LEFT JOIN LATERAL (
    SELECT *
    FROM rabere_detection.telemetry
    WHERE device_id = d.id
    ORDER BY timestamp DESC
    LIMIT 1
) t ON true;

-- Create functions
CREATE OR REPLACE FUNCTION rabere_detection.update_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_device_timestamp
    BEFORE UPDATE ON rabere_detection.devices
    FOR EACH ROW
    EXECUTE FUNCTION rabere_detection.update_device_timestamp();

-- Create roles and permissions
CREATE ROLE rabere_detection_read;
CREATE ROLE rabere_detection_write;

GRANT USAGE ON SCHEMA rabere_detection TO rabere_detection_read;
GRANT SELECT ON ALL TABLES IN SCHEMA rabere_detection TO rabere_detection_read;

GRANT USAGE ON SCHEMA rabere_detection TO rabere_detection_write;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA rabere_detection TO rabere_detection_write;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA rabere_detection TO rabere_detection_write; 