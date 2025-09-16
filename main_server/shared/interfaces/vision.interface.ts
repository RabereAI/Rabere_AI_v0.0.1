export interface FrameData {
    deviceId: string;
    timestamp: Date;
    frame: Buffer;
    metadata: {
        resolution: string;
        format: string;
        frameNumber: number;
    };
}

export interface VisionAnalysisResult {
    id: string;
    deviceId: string;
    timestamp: Date;
    behaviorMetrics: {
        aggressionLevel: number;
        hydrophobiaScore: number;
        coordinationScore: number;
        movementPattern: string;
    };
    anomalies: Array<{
        type: string;
        severity: string;
        confidence: number;
    }>;
} 