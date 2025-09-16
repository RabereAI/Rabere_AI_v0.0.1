export interface FrameData {
    deviceId: string;
    timestamp: Date;
    imageData: Buffer;
    resolution: {
        width: number;
        height: number;
    };
    format: 'JPEG' | 'PNG' | 'RAW';
}

export interface VisionAnalysisResult {
    id: string;
    deviceId: string;
    timestamp: Date;
    rabereDetected: boolean;
    rabereLocation: Point3D;
    posture: RaberePosture;
    movementMetrics: MovementMetrics;
    webBuildingMetrics: WebBuildingMetrics;
    feedingMetrics: FeedingMetrics;
    restingPeriods: RestingPeriod[];
    anomalies: VisionAnomaly[];
}

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export interface MovementMetrics {
    frequency: number;
    velocity: number;
    direction: Point3D;
}

export interface WebBuildingMetrics {
    frequency: number;
    webSize: number;
    webType: 'NORMAL' | 'IRREGULAR' | 'DAMAGED';
}

export interface VisionAnomaly {
    type: string;
    confidence: number;
    location: Point3D;
    timestamp: Date;
    details: string;
} 