import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DeviceCommandType, CommandPriority, CommandStatus, DeviceCommandParameters } from '@shared/interfaces/device-control.interface';
import { DeviceEntity } from './device.entity';

@Entity('device_commands')
export class DeviceCommandEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DeviceEntity, device => device.commands)
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @Column()
  deviceId: string;

  @Column({
    type: 'enum',
    enum: DeviceCommandType,
  })
  type: DeviceCommandType;

  @Column({
    type: 'jsonb',
  })
  parameters: DeviceCommandParameters;

  @Column({
    type: 'enum',
    enum: CommandPriority,
  })
  priority: CommandPriority;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: CommandStatus,
    default: CommandStatus.PENDING,
  })
  status: CommandStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', nullable: true })
  result?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  executedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;
} 