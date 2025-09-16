import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceSchedule, MaintenanceTaskType, MaintenanceStatus } from '../../../shared/interfaces/maintenance.interface';
import { DeviceControlService } from '../../device-control/src/DeviceControlService';
import { NotificationService } from '../../notification/src/NotificationService';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MaintenanceService {
    constructor(
        @InjectRepository(MaintenanceSchedule)
        private maintenanceRepository: Repository<MaintenanceSchedule>,
        private readonly deviceControlService: DeviceControlService,
        private readonly notificationService: NotificationService
    ) {}

    async scheduleTask(task: MaintenanceSchedule): Promise<void> {
        await this.maintenanceRepository.save(task);
    }

    async executeTask(taskId: string): Promise<void> {
        const task = await this.maintenanceRepository.findOneOrFail(taskId);
        
        await this.updateTaskStatus(taskId, MaintenanceStatus.IN_PROGRESS);

        try {
            switch (task.taskType) {
                case MaintenanceTaskType.CLEANING:
                    await this.performCleaning(task.deviceId);
                    break;
                case MaintenanceTaskType.FILTER_CHANGE:
                    await this.changeFilter(task.deviceId);
                    break;
                case MaintenanceTaskType.WATER_CHANGE:
                    await this.changeWater(task.deviceId);
                    break;
            }

            await this.updateTaskStatus(taskId, MaintenanceStatus.COMPLETED);
        } catch (error) {
            await this.updateTaskStatus(taskId, MaintenanceStatus.FAILED);
            throw error;
        }
    }

    private async performCleaning(deviceId: string): Promise<void> {
        await this.deviceControlService.sendCommand({
            commandId: uuid(),
            deviceId,
            command: 'START_CLEANING',
            parameters: {
                mode: 'FULL',
                intensity: 'NORMAL'
            }
        });
    }

    private async changeFilter(deviceId: string): Promise<void> {
        await this.deviceControlService.sendCommand({
            commandId: uuid(),
            deviceId,
            command: 'FILTER_MAINTENANCE',
            parameters: {
                action: 'REPLACE'
            }
        });
    }

    private async changeWater(deviceId: string): Promise<void> {
        await this.deviceControlService.sendCommand({
            commandId: uuid(),
            deviceId,
            command: 'WATER_CHANGE',
            parameters: {
                volume: 1000,
                mode: 'AUTOMATIC'
            }
        });
    }

    private async updateTaskStatus(taskId: string, status: MaintenanceStatus): Promise<void> {
        await this.maintenanceRepository.update(taskId, { 
            status,
            lastExecuted: status === MaintenanceStatus.COMPLETED ? new Date() : undefined
        });
    }
} 