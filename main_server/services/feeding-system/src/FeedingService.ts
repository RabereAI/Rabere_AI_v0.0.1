import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { rabereHealthService } from '../../rabere-health/src/RabereHealthService';
import { DeviceControlService } from '../../device-control/src/DeviceControlService';
import { CreateFeedingScheduleDto } from '../../shared/interfaces/feeding.interface';
import { uuid } from 'uuid';

@Injectable()
export class FeedingService {
    constructor(
        @InjectRepository(FeedingSchedule)
        private feedingRepository: Repository<FeedingSchedule>,
        private readonly rabereHealthService: RabereHealthService,
        private readonly deviceControlService: DeviceControlService
    ) {}

    async scheduleFeed(schedule: CreateFeedingScheduleDto): Promise<void> {
        const feedingSchedule = this.feedingRepository.create({
            ...schedule,
            status: 'SCHEDULED'
        });

        await this.feedingRepository.save(feedingSchedule);
    }

    async executeFeed(scheduleId: string): Promise<void> {
        const schedule = await this.feedingRepository.findOneOrFail(scheduleId);
        
        await this.deviceControlService.sendCommand({
            commandId: uuid(),
            deviceId: schedule.deviceId,
            command: 'RELEASE_PREY',
            parameters: {
                type: schedule.preyType,
                size: schedule.preySize
            }
        });

        await this.monitorFeeding(scheduleId);
    }

    private async monitorFeeding(scheduleId: string): Promise<void> {
        // Мониторинг процесса кормления через камеры
        // Анализ поведения паука
        // Обновление записей о здоровье
    }
} 