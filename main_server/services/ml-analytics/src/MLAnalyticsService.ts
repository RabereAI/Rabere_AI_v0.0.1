import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MLPredictionEntity } from '../entities/ml-prediction.entity';
import { MLPrediction, PredictionType, FeatureSet } from '../../../shared/interfaces/ml-analytics.interface';
import { NotificationService } from '../../notification/src/NotificationService';
import { TelemetryService } from '../../telemetry/src/TelemetryService';

@Injectable()
export class MLAnalyticsService {
    constructor(
        @InjectRepository(MLPredictionEntity)
        private mlRepository: Repository<MLPredictionEntity>,
        private readonly notificationService: NotificationService,
        private readonly telemetryService: TelemetryService
    ) {}

    async predictBehavior(deviceId: string): Promise<MLPrediction> {
        const features = await this.collectFeatures(deviceId);
        const prediction = await this.runBehaviorPrediction(features);
        
        await this.mlRepository.save(prediction);

        if (prediction.confidence > 0.8) {
            await this.notificationService.notify({
                type: 'BEHAVIOR_PREDICTION',
                deviceId,
                prediction
            });
        }

        return prediction;
    }

    private async collectFeatures(deviceId: string): Promise<FeatureSet> {
        const telemetry = await this.telemetryService.getLatestTelemetry(deviceId);
        // Реализация сбора характеристик
        return {
            deviceId,
            videoFrames: [],
            motionData: [],
            behaviorMetrics: {
                aggressionLevel: 0,
                hydrophobiaScore: 0,
                coordinationScore: 0
            },
            timestamp: new Date()
        };
    }

    private async runBehaviorPrediction(features: FeatureSet): Promise<MLPrediction> {
        // Реализация предсказания
        return {
            id: 'generated-id',
            deviceId: features.deviceId,
            timestamp: new Date(),
            predictionType: PredictionType.BEHAVIOR_ANALYSIS,
            confidence: 0.85,
            predictedValues: {
                aggressionScore: 0.7,
                hydrophobiaScore: 0.6,
                coordinationScore: 0.5,
                riskLevel: 'HIGH'
            }
        };
    }
} 