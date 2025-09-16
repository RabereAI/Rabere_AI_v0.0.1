export interface EnvironmentParameters {
    temperature: number;
    humidity: number;
    lightLevel: number;
    airQuality: number;
}

export interface DeviceCommand {
    id: string;
    type: DeviceCommandType;
    parameters: DeviceCommandParameters;
    priority: CommandPriority;
    timestamp: Date;
    expiresAt?: Date;
    status: CommandStatus;
}

export interface DeviceCommandParameters {
    targetValue?: number;
    duration?: number;
    zone?: string;
    intensity?: number;
    mode?: OperationMode;
    quality?: 'LOW' | 'MEDIUM' | 'HIGH';
    resolution?: string;
    fps?: number;
}

export enum DeviceCommandType {
    SET_TEMPERATURE = 'set_temperature',
    SET_HUMIDITY = 'set_humidity',
    ADJUST_LIGHTING = 'adjust_lighting',
    ACTIVATE_MISTING = 'activate_misting',
    TOGGLE_VENTILATION = 'toggle_ventilation',
    EMERGENCY_SHUTDOWN = 'EMERGENCY_SHUTDOWN',
    SET_CAMERA = 'SET_CAMERA',
    SET_NIGHT_VISION = 'SET_NIGHT_VISION',
    START_RECORDING = 'START_RECORDING',
    STOP_RECORDING = 'STOP_RECORDING',
    ADJUST_FOCUS = 'ADJUST_FOCUS'
}

export enum CommandPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    EMERGENCY = 'EMERGENCY'
}

export enum CommandStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export enum OperationMode {
    AUTO = 'auto',
    MANUAL = 'manual',
    ECO = 'eco',
    MAINTENANCE = 'maintenance'
}

export interface DeviceStatus {
    id: string;
    type: DeviceType;
    status: DeviceOperationalStatus;
    currentValues: DeviceValues;
    lastMaintenance: Date;
    firmwareVersion: string;
    uptime: number;
    errors: DeviceError[];
    operationalStatus: DeviceOperationalStatus;
    cameraActive: boolean;
    nightVisionActive: boolean;
    recordingStatus: boolean;
    currentResolution: string;
    currentFps: number;
    lastUpdate: Date;
}

export interface DeviceValues {
    temperature?: number;
    humidity?: number;
    lightLevel?: number;
    fanSpeed?: number;
    mistingLevel?: number;
}

export enum DeviceType {
    TEMPERATURE_CONTROLLER = 'temperature_controller',
    HUMIDITY_CONTROLLER = 'humidity_controller',
    LIGHTING_SYSTEM = 'lighting_system',
    VENTILATION_SYSTEM = 'ventilation_system',
    MISTING_SYSTEM = 'misting_system'
}

export enum DeviceOperationalStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    ERROR = 'ERROR',
    MAINTENANCE = 'MAINTENANCE'
}

export interface DeviceError {
    id: string;
    code: string;
    message: string;
    timestamp: Date;
    severity: ErrorSeverity;
    resolved: boolean;
}

export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export interface DeviceCalibration {
    id: string;
    deviceId: string;
    type: CalibrationType;
    timestamp: Date;
    parameters: Record<string, number>;
    result: CalibrationResult;
}

export enum CalibrationType {
    TEMPERATURE = 'temperature',
    HUMIDITY = 'humidity',
    LIGHT = 'light',
    FULL_SYSTEM = 'full_system'
}

export enum CalibrationResult {
    SUCCESS = 'success',
    FAILED = 'failed',
    PARTIAL = 'partial',
    NEEDS_REVIEW = 'needs_review'
} 