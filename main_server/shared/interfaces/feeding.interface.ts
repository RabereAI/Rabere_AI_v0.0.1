export interface FeedingSchedule {
    id: string;
    deviceId: string;
    preyType: PreyType;
    preySize: PreySize;
    scheduledTime: Date;
    status: FeedingStatus;
    executionTime?: Date;
    duration?: number;
    success?: boolean;
    notes?: string;
}

export enum PreyType {
    CRICKET = 'CRICKET',
    MEALWORM = 'MEALWORM',
    FRUIT_FLY = 'FRUIT_FLY',
    COCKROACH = 'COCKROACH'
}

export enum PreySize {
    EXTRA_SMALL = 'EXTRA_SMALL',
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    LARGE = 'LARGE'
}

export enum FeedingStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface CreateFeedingScheduleDto {
    deviceId: string;
    preyType: PreyType;
    preySize: PreySize;
    scheduledTime: Date;
    notes?: string;
} 