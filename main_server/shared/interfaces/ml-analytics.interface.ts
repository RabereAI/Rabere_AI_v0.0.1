import { TimePeriod } from './telemetry.interface';

export interface MLPrediction {
    id: string;
    deviceId: string;
    timestamp: Date;
    predictionType: PredictionType;
    confidence: number;
    predictedValues: {
        aggressionScore?: number;
        hydrophobiaScore?: number;
        coordinationScore?: number;
        riskLevel?: string;
        symptoms?: string[];
    };
}

export interface FeatureSet {
    deviceId: string;
    videoFrames: number[][];
    motionData: number[][];
    behaviorMetrics: {
        aggressionLevel: number;
        hydrophobiaScore: number;
        coordinationScore: number;
    };
    timestamp: Date;
}

export interface EnvironmentFeatures {
    temperatureHistory: number[];
    humidityHistory: number[];
    lightLevelHistory: number[];
    airQualityHistory: number[];
}

export interface BehaviorFeatures {
    activityLevel: number;
    webBuildingFrequency: number;
    feedingPatterns: number[];
    restingDuration: number;
}

export interface HealthFeatures {
    lastMoltingDate: Date;
    weightTrend: number[];
    appetiteLevel: number;
    movementQuality: number;
}

export interface BehaviorAnalysis {
  id: string;
  timestamp: Date;
  rabereId: string;
  behaviorPatterns: BehaviorPattern[];
  predictions: BehaviorPrediction[];
  anomalies: BehaviorAnomaly[];
  confidenceScore: number;
}

export interface BehaviorPattern {
  type: PatternType;
  frequency: number;
  duration: number;
  timeOfDay: TimeOfDay[];
  correlations: EnvironmentalCorrelation[];
}

export interface BehaviorPrediction {
  type: PredictionType;
  probability: number;
  expectedTimeframe: TimePeriod;
  triggerConditions: TriggerCondition[];
  impactLevel: ImpactLevel;
}

export interface BehaviorAnomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  detectionTime: Date;
  duration: number;
  relatedPatterns: PatternType[];
  confidence: number;
}

export interface EnvironmentalCorrelation {
  factor: EnvironmentalFactor;
  correlation: number;
  significance: number;
  timelag: number;
}

export interface TriggerCondition {
  factor: EnvironmentalFactor | BehaviorFactor;
  threshold: number;
  operator: 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE';
  duration?: number;
}

export enum PatternType {
  WEB_BUILDING = 'web_building',
  HUNTING = 'hunting',
  RESTING = 'resting',
  GROOMING = 'grooming',
  EXPLORING = 'exploring',
  MOLTING = 'molting'
}

export enum PredictionType {
    BEHAVIOR_ANALYSIS = 'BEHAVIOR_ANALYSIS',
    SYMPTOM_DETECTION = 'SYMPTOM_DETECTION',
    RISK_ASSESSMENT = 'RISK_ASSESSMENT'
}

export enum AnomalyType {
  UNUSUAL_MOVEMENT = 'unusual_movement',
  IRREGULAR_WEB_PATTERN = 'irregular_web_pattern',
  ABNORMAL_RESTING = 'abnormal_resting',
  FEEDING_BEHAVIOR = 'feeding_behavior',
  ENVIRONMENTAL_RESPONSE = 'environmental_response'
}

export enum AnomalySeverity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TimeOfDay {
  EARLY_MORNING = 'early_morning',
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  LATE_NIGHT = 'late_night'
}

export enum EnvironmentalFactor {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  LIGHT_LEVEL = 'light_level',
  VIBRATION = 'vibration',
  AIR_FLOW = 'air_flow'
}

export enum BehaviorFactor {
  ACTIVITY_LEVEL = 'activity_level',
  WEB_BUILDING_FREQUENCY = 'web_building_frequency',
  FEEDING_RESPONSE = 'feeding_response',
  MOVEMENT_PATTERN = 'movement_pattern',
  REST_DURATION = 'rest_duration'
}

export enum ImpactLevel {
  NEGLIGIBLE = 'negligible',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  SEVERE = 'severe'
} 