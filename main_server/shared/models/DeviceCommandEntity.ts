import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { DeviceCommand } from '../interfaces/device-control.interface';

@Entity('device_commands')
export class DeviceCommandEntity implements DeviceCommand {
    @PrimaryGeneratedColumn('uuid')
    commandId: string;

    @Column()
    deviceId: string;

    @Column({
        type: 'enum',
        enum: ['SET_TEMPERATURE', 'SET_HUMIDITY', 'SET_LIGHT', 'EMERGENCY_STOP']
    })
    command: 'SET_TEMPERATURE' | 'SET_HUMIDITY' | 'SET_LIGHT' | 'EMERGENCY_STOP';

    @Column('jsonb')
    parameters: {
        value: number;
        unit: string;
    };

    @CreateDateColumn()
    timestamp: Date;

    @Column({ default: false })
    executed: boolean;

    @Column({ nullable: true })
    executedAt?: Date;
} 