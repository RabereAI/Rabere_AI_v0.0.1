import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisionAnalysisService } from './VisionAnalysisService';
import { VisionAnalysisResult } from '../../../shared/models/VisionAnalysisResult';
import { RabereHealthModule } from '../../rabere-health/src/RabiesHealthModule';
import { NotificationModule } from '../../notification/src/NotificationModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([VisionAnalysisResult]),
        RabereHealthModule,
        NotificationModule
    ],
    providers: [VisionAnalysisService],
    exports: [VisionAnalysisService]
})
export class VisionAnalysisModule {} 