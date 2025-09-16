export interface SystemNotification {
    type: NotificationType;
    deviceId?: string;
    message?: string;
    severity?: NotificationSeverity;
    timestamp: Date;
    anomalies?: any[];
    prediction?: any;
    insights?: any;
}

export enum NotificationType {
    EMERGENCY = 'EMERGENCY',
    PARAMETER_ALERT = 'PARAMETER_ALERT',
    BEHAVIOR_PREDICTION = 'BEHAVIOR_PREDICTION',
    HEALTH_ALERT = 'HEALTH_ALERT',
    VISION_ALERT = 'VISION_ALERT',
    RABIES_SYMPTOMS_DETECTED = 'RABIES_SYMPTOMS_DETECTED'
}

export enum NotificationSeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL'
} 