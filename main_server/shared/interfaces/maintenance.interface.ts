export interface MaintenanceSchedule {
    id: string;
    deviceId: string;
    taskType: MaintenanceTaskType;
    scheduledTime: Date;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    lastExecuted?: Date;
    nextDue: Date;
}

export enum MaintenanceTaskType {
    CLEANING = 'CLEANING',
    FILTER_CHANGE = 'FILTER_CHANGE',
    WATER_CHANGE = 'WATER_CHANGE',
    SUBSTRATE_CHANGE = 'SUBSTRATE_CHANGE',
    EQUIPMENT_CHECK = 'EQUIPMENT_CHECK'
}

export enum MaintenanceStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    SKIPPED = 'SKIPPED'
}

export enum MaintenancePriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
} 