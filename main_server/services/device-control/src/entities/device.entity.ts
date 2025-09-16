import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DeviceType, DeviceOperationalStatus, DeviceValues } from '@shared/interfaces/device-control.interface';
import { DeviceCommandEntity } from './device-command.entity';

@Entity('devices')
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
  })
  type: DeviceType;

  @Column({
    type: 'enum',
    enum: DeviceOperationalStatus,
    default: DeviceOperationalStatus.OFFLINE,
  })
  status: DeviceOperationalStatus;

  @Column({ type: 'jsonb' })
  currentValues: DeviceValues;

  @Column()
  firmwareVersion: string;

  @Column({ type: 'float' })
  uptime: number;

  @Column({ type: 'jsonb', default: [] })
  errors: Array<{
    code: string;
    message: string;
    timestamp: Date;
    severity: string;
  }>;

  @Column()
  zoneId: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenance: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCalibration: Date;

  @OneToMany(() => DeviceCommandEntity, command => command.device)
  commands: DeviceCommandEntity[];
} 