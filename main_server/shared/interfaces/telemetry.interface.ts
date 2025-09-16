export interface EnvironmentData {
  temperature: number;
  humidity: number;
  timestamp: Date;
  sensorId: string;
  zoneId: string;
}

export interface SensorMetadata {
  id: string;
  type: SensorType;
  location: SensorLocation;
  status: SensorStatus;
  lastCalibration: Date;
  accuracy: number;
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  MOTION = 'motion',
  LIGHT = 'light'
}

export interface SensorLocation {
  x: number;
  y: number;
  z: number;
  zone: string;
}

export enum SensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CALIBRATING = 'calibrating',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

export interface EnvironmentMetrics {
  averageTemperature: number;
  averageHumidity: number;
  temperatureRange: Range;
  humidityRange: Range;
  period: TimePeriod;
}

export interface Range {
  min: number;
  max: number;
  optimal: number;
}

export interface TimePeriod {
  start: Date;
  end: Date;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  sensorId: string;
  value: number;
  threshold: number;
}

export enum AlertType {
  HIGH_TEMPERATURE = 'high_temperature',
  LOW_TEMPERATURE = 'low_temperature',
  HIGH_HUMIDITY = 'high_humidity',
  LOW_HUMIDITY = 'low_humidity',
  SENSOR_MALFUNCTION = 'sensor_malfunction'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
} 