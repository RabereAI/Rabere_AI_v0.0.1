import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DeviceControlService } from './DeviceControlService';
import { DeviceEntity } from './entities/device.entity';
import { DeviceCommandEntity } from './entities/device-command.entity';
import { DeviceController } from './DeviceController';
import { DeviceRepository } from './repositories/device.repository';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forFeature([
            DeviceEntity,
            DeviceCommandEntity,
        ]),
    ],
    controllers: [DeviceController],
    providers: [
        DeviceControlService,
        DeviceRepository,
    ],
    exports: [DeviceControlService]
})
export class DeviceControlModule {} 