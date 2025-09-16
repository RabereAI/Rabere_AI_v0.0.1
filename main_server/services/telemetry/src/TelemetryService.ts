import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TelemetryRecord } from '../../../shared/models/TelemetryRecord';
import { EnvironmentParameters } from '../../../shared/interfaces/device-control.interface';
import { AnalyticsService } from '../../analytics/src/AnalyticsService';

@Injectable()
export class TelemetryService {
    constructor(
        @InjectRepository(TelemetryRecord)
        private telemetryRepository: Repository<TelemetryRecord>,
        private readonly analyticsService: AnalyticsService
    ) {}

    async recordTelemetry(deviceId: string, parameters: EnvironmentParameters): Promise<void> {
        const record = this.telemetryRepository.create({
            deviceId,
            timestamp: new Date(),
            parameters,
        });

        await this.telemetryRepository.save(record);
        await this.analyticsService.processNewTelemetry(record);
    }

    async getDeviceHistory(
        deviceId: string,
        startTime: Date,
        endTime: Date
    ): Promise<TelemetryRecord[]> {
        return this.telemetryRepository.find({
            where: {
                deviceId,
                timestamp: Between(startTime, endTime)
            },
            order: {
                timestamp: 'DESC'
            }
        });
    }

    async getLatestTelemetry(deviceId: string): Promise<TelemetryRecord> {
        return await this.telemetryRepository.findOne({
            where: { deviceId },
            order: { timestamp: 'DESC' }
        });
    }

    async saveTelemetry(telemetry: TelemetryRecord): Promise<void> {
        await this.telemetryRepository.save(telemetry);
    }
} 