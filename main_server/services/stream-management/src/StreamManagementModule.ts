import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamManagementService } from './StreamManagementService';
import { StreamSession } from '../../../shared/models/StreamSession';
import { VisionAnalysisModule } from '../../vision-analysis/src/VisionAnalysisModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([StreamSession]),
        VisionAnalysisModule
    ],
    providers: [StreamManagementService],
    exports: [StreamManagementService]
})
export class StreamManagementModule {} 