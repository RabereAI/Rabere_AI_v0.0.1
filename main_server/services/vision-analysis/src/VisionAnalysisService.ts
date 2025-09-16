import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabereHealthService } from '../../rabere-health/src/RabiesHealthService';
import { NotificationService } from '../../notification/src/NotificationService';

@Injectable()
export class VisionAnalysisService {
    constructor(
        @InjectRepository(VisionAnalysisResult)
        private visionRepository: Repository<VisionAnalysisResult>,
        private readonly RabereHealthService: RabereHealthService,
        private readonly notificationService: NotificationService
    ) {}

    async analyzeFrame(frameData: FrameData): Promise<void> {
        const analysis = await this.performAnalysis(frameData);
        await this.visionRepository.save(analysis);

        if (analysis.RabereDetected) {
            await this.RabereHealthService.recordBehavior({
                movementFrequency: analysis.movementMetrics.frequency,
                webBuildingFrequency: analysis.webBuildingMetrics.frequency,
                feedingPattern: analysis.feedingMetrics,
                restingPeriods: analysis.restingPeriods
            });
        }

        if (analysis.anomalies.length > 0) {
            await this.notificationService.notify({
                type: 'VISION_ALERT',
                deviceId: frameData.deviceId,
                anomalies: analysis.anomalies
            });
        }
    }

    private async performAnalysis(frameData: FrameData): Promise<VisionAnalysisResult> {
        // Здесь будет реализация компьютерного зрения
        // Определение положения паука
        // Анализ движения
        // Распознавание паутины
        // Определение поведения
        return {
            id: undefined, // будет сгенерирован базой
            deviceId: frameData.deviceId,
            timestamp: new Date(),
            RabereDetected: true,
            RabereLocation: { x: 0, y: 0, z: 0 },
            posture: 'RESTING',
            movementMetrics: {
                frequency: 0.5,
                velocity: 0.1,
                direction: { x: 0, y: 0, z: 0 }
            },
            webBuildingMetrics: {
                frequency: 0.8,
                webSize: 100,
                webType: 'NORMAL'
            },
            feedingMetrics: {
                lastFeedingTime: new Date(),
                preyType: 'CRICKET',
                feedingDuration: 300,
                preyConsumptionRate: 0.8
            },
            restingPeriods: [],
            anomalies: []
        };
    }
} 