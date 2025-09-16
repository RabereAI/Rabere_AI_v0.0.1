import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelemetryRecord, BehaviorParameters } from '../../../shared/models/TelemetryRecord';
import { Anomaly } from '../../../shared/interfaces/analytics.interface';
import { NotificationService } from '../../notification/src/NotificationService';
import { AnalyticsData } from '../entities/analytics-data.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(AnalyticsData)
        private analyticsRepository: Repository<AnalyticsData>,
        private readonly notificationService: NotificationService
    ) {}

    async processNewTelemetry(telemetry: TelemetryRecord): Promise<void> {
        const anomalies = await this.detectAnomalies(telemetry);
        await this.updateStatistics(telemetry, anomalies);
        await this.generateBehaviorInsights(telemetry.deviceId);
    }

    private async detectAnomalies(telemetry: TelemetryRecord): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];

        // Проверка агрессивного поведения
        if (telemetry.parameters.aggressionLevel > 0.7) {
            anomalies.push({
                type: 'HIGH_AGGRESSION',
                severity: 'HIGH',
                value: telemetry.parameters.aggressionLevel,
                threshold: 0.7
            });
        }

        // Проверка гидрофобии
        if (telemetry.parameters.hydrophobiaScore > 0.6) {
            anomalies.push({
                type: 'HYDROPHOBIA_DETECTED',
                severity: 'CRITICAL',
                value: telemetry.parameters.hydrophobiaScore,
                threshold: 0.6
            });
        }

        // Проверка нарушений координации
        if (telemetry.parameters.coordinationScore < 0.4) {
            anomalies.push({
                type: 'COORDINATION_ISSUES',
                severity: 'MEDIUM',
                value: telemetry.parameters.coordinationScore,
                threshold: 0.4
            });
        }

        if (anomalies.length > 0) {
            await this.notificationService.notify({
                type: 'RABIES_SYMPTOMS_DETECTED',
                deviceId: telemetry.deviceId,
                anomalies,
                timestamp: new Date()
            });
        }

        return anomalies;
    }

    private async updateStatistics(telemetry: TelemetryRecord, anomalies: Anomaly[]): Promise<void> {
        const stats = new AnalyticsData();
        stats.deviceId = telemetry.deviceId;
        stats.timestamp = new Date();
        stats.behaviorMetrics = {
            aggressionLevel: telemetry.parameters.aggressionLevel,
            hydrophobiaScore: telemetry.parameters.hydrophobiaScore,
            coordinationScore: telemetry.parameters.coordinationScore
        };
        stats.anomalies = anomalies;
        stats.alertLevel = this.calculateAlertLevel(anomalies);

        await this.analyticsRepository.save(stats);
    }

    private async generateBehaviorInsights(deviceId: string): Promise<void> {
        const recentStats = await this.analyticsRepository.find({
            where: { deviceId },
            order: { timestamp: 'DESC' },
            take: 100
        });

        // Анализ тенденций в поведении
        const insights = this.analyzeBehaviorTrends(recentStats);

        if (insights.riskLevel === 'HIGH') {
            await this.notificationService.notify({
                type: 'BEHAVIOR_RISK_ALERT',
                deviceId,
                insights,
                timestamp: new Date()
            });
        }
    }

    private calculateAlertLevel(anomalies: Anomaly[]): string {
        const severityScores = {
            'LOW': 1,
            'MEDIUM': 2,
            'HIGH': 3,
            'CRITICAL': 4
        };

        const totalScore = anomalies.reduce((score, anomaly) => 
            score + severityScores[anomaly.severity], 0);

        if (totalScore >= 6) return 'CRITICAL';
        if (totalScore >= 4) return 'HIGH';
        if (totalScore >= 2) return 'MEDIUM';
        return 'LOW';
    }

    private analyzeBehaviorTrends(stats: AnalyticsData[]): any {
        // Реализация анализа тенденций
        return {
            riskLevel: 'HIGH',
            trends: {
                aggression: 'INCREASING',
                hydrophobia: 'PRESENT',
                coordination: 'DECREASING'
            }
        };
    }
} 