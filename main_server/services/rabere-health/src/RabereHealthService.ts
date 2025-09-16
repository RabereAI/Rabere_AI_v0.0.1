import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../../notification/src/NotificationService';
import { RabereHealthRecord } from '../../../shared/models/RabereHealthRecord';
import { RabereBehaviorData } from '../../../shared/interfaces/Rabere-health.interface';

@Injectable()
export class RabereHealthService {
    constructor(
        @InjectRepository(RabereHealthRecord)
        private healthRepository: Repository<RabereHealthRecord>,
        private readonly notificationService: NotificationService
    ) {}

    async recordBehavior(data: RabereBehaviorData): Promise<void> {
        const record = this.healthRepository.create({
            timestamp: new Date(),
            ...data
        });

        await this.healthRepository.save(record);
        await this.analyzeHealth(data);
    }

    private async analyzeHealth(data: RabereBehaviorData): Promise<void> {
        const anomalies = [];

        if (data.movementFrequency < 0.2) {
            anomalies.push({
                type: 'LOW_ACTIVITY',
                severity: 'HIGH',
                details: 'Rabere showing unusually low activity'
            });
        }

        if (data.webBuildingFrequency < 0.5) {
            anomalies.push({
                type: 'REDUCED_WEB_BUILDING',
                severity: 'MEDIUM',
                details: 'Reduced web-building activity detected'
            });
        }

        if (anomalies.length > 0) {
            await this.notificationService.notify({
                type: 'HEALTH_ALERT',
                anomalies,
                timestamp: new Date()
            });
        }
    }
} 