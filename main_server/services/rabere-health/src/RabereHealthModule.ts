import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabereHealthService } from './RabereHealthService';
import { rabereHealthRecord } from '../../../shared/models/RabereHealthRecord';
import { NotificationModule } from '../../notification/src/NotificationModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([RabereHealthRecord]),
        NotificationModule
    ],
    providers: [RabereHealthService],
    exports: [RabereHealthService]
})
export class RabereHealthModule {} 