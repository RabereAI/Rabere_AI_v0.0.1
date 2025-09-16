export interface StreamConfig {
    resolution: string;
    frameRate: number;
    codec: string;
    streamKey: string;
}

export interface StreamSession {
    id: string;
    deviceId: string;
    startTime: Date;
    endTime?: Date;
    config: StreamConfig;
    status: StreamStatus;
    viewerCount: number;
    quality: StreamQualityMetrics;
}

export interface StreamQualityMetrics {
    bitrate: number;
    packetLoss: number;
    latency: number;
    jitter: number;
}

export interface StreamMetadata {
  id: string;
  status: StreamStatus;
  resolution: StreamResolution;
  startedAt: Date;
  viewerCount: number;
  quality: StreamQuality;
}

export interface StreamSettings {
  resolution: StreamResolution;
  frameRate: number;
  bitrate: number;
  codec: StreamCodec;
  quality: StreamQuality;
}

export enum StreamStatus {
    INITIALIZING = 'INITIALIZING',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    STOPPED = 'STOPPED',
    ERROR = 'ERROR'
}

export enum StreamResolution {
  HD_720P = '1280x720',
  HD_1080P = '1920x1080',
  UHD_4K = '3840x2160'
}

export enum StreamCodec {
  H264 = 'h264',
  H265 = 'h265',
  VP9 = 'vp9'
}

export enum StreamQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

export interface StreamEvent {
  type: StreamEventType;
  timestamp: Date;
  data: any;
}

export enum StreamEventType {
  STARTED = 'started',
  STOPPED = 'stopped',
  QUALITY_CHANGED = 'quality_changed',
  ERROR = 'error',
  VIEWER_JOINED = 'viewer_joined',
  VIEWER_LEFT = 'viewer_left'
} 