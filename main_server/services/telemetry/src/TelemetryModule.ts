import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryService } from './TelemetryService';
import { TelemetryRecord } from '../../../shared/models/TelemetryRecord';
import { AnalyticsModule } from '../../analytics/src/AnalyticsModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([TelemetryRecord]),
        AnalyticsModule
    ],
    providers: [TelemetryService],
    exports: [TelemetryService]
})
export class TelemetryModule {} 