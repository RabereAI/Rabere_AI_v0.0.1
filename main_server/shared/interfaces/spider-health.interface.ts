export interface RabereBehaviorData {
    movementFrequency: number;
    webBuildingFrequency: number;
    feedingPattern: FeedingPattern;
    restingPeriods: RestingPeriod[];
    molting?: MoltingData;
}

export interface FeedingPattern {
    lastFeedingTime: Date;
    preyType: string;
    feedingDuration: number;
    preyConsumptionRate: number;
}

export interface RestingPeriod {
    startTime: Date;
    endTime: Date;
    location: string;
    posture: RaberePosture;
}

export interface MoltingData {
    startTime: Date;
    duration: number;
    oldExoskeletonSize: number;
    newExoskeletonSize: number;
    success: boolean;
}

export enum RaberePosture {
    HUNTING = 'HUNTING',
    RESTING = 'RESTING',
    WEB_BUILDING = 'WEB_BUILDING',
    DEFENSIVE = 'DEFENSIVE',
    MOLTING = 'MOLTING'
}

export interface RabereHealth {
  id: string;
  timestamp: Date;
  activityLevel: ActivityLevel;
  feedingStatus: FeedingStatus;
  lastFed: Date;
  behaviorMetrics: BehaviorMetrics;
  healthScore: number;
  alerts: HealthAlert[];
}

export interface BehaviorMetrics {
  movementFrequency: number;
  webBuildingActivity: WebActivity;
  restingPeriods: TimePeriod[];
  locationHeatmap: LocationData[];
}

export interface WebActivity {
  lastWebBuilt: Date;
  webQuality: WebQualityMetrics;
  maintenanceFrequency: number;
}

export interface WebQualityMetrics {
  symmetry: number;
  density: number;
  size: WebSize;
  condition: WebCondition;
}

export interface LocationData {
  position: Position3D;
  duration: number;
  timestamp: Date;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface WebSize {
  width: number;
  height: number;
  area: number;
}

export enum ActivityLevel {
  INACTIVE = 'inactive',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  UNUSUAL = 'unusual'
}

export enum FeedingStatus {
  HUNGRY = 'hungry',
  RECENTLY_FED = 'recently_fed',
  NORMAL = 'normal',
  OVERFED = 'overfed'
}

export enum WebCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged'
}

export interface HealthAlert {
  id: string;
  type: HealthAlertType;
  severity: HealthAlertSeverity;
  description: string;
  timestamp: Date;
  relatedMetrics: string[];
}

export enum HealthAlertType {
  IRREGULAR_MOVEMENT = 'irregular_movement',
  FEEDING_ISSUE = 'feeding_issue',
  WEB_CONDITION = 'web_condition',
  BEHAVIOR_CHANGE = 'behavior_change',
  ENVIRONMENT_STRESS = 'environment_stress'
}

export enum HealthAlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  URGENT = 'urgent',
  CRITICAL = 'critical'
} 