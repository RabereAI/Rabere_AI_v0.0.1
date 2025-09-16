export interface Anomaly {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    value: number;
    threshold: number;
}

export interface AnalyticsData {
    id: string;
    deviceId: string;
    period: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    startTime: Date;
    endTime: Date;
    metrics: {
        averageTemperature: number;
        averageHumidity: number;
        anomalyCount: number;
        streamUptime: number;
        viewerCount: number;
    };
    insights: string[];
} 