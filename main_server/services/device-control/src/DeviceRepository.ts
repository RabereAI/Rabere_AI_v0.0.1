import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceCommand, DeviceStatus } from '../../../shared/interfaces/device-control.interface';
import { Device } from '../../../shared/models/Device';
import { DeviceCommandEntity } from '../../../shared/models/DeviceCommandEntity';

@Injectable()
export class DeviceRepository {
    constructor(
        @InjectRepository(Device)
        private deviceRepo: Repository<Device>,
        @InjectRepository(DeviceCommandEntity)
        private commandRepo: Repository<DeviceCommandEntity>
    ) {}

    async saveCommand(command: DeviceCommand): Promise<void> {
        const commandEntity = this.commandRepo.create(command);
        await this.commandRepo.save(commandEntity);
    }

    async getStatus(deviceId: string): Promise<DeviceStatus> {
        const device = await this.deviceRepo.findOneOrFail({
            where: { id: deviceId }
        });
        return device.status;
    }

    async updateDeviceStatus(deviceId: string, status: Partial<DeviceStatus>): Promise<void> {
        await this.deviceRepo.update(deviceId, { status });
    }
} 