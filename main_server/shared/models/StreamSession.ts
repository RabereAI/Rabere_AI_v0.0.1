import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StreamConfig, StreamQualityMetrics } from '../interfaces/stream.interface';

@Entity('stream_sessions')
export class StreamSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    deviceId: string;

    @CreateDateColumn()
    startTime: Date;

    @Column({ nullable: true })
    endTime?: Date;

    @Column('jsonb')
    config: StreamConfig;

    @Column({
        type: 'enum',
        enum: ['INITIALIZING', 'ACTIVE', 'STOPPED', 'ERROR']
    })
    status: 'INITIALIZING' | 'ACTIVE' | 'STOPPED' | 'ERROR';

    @Column('int', { default: 0 })
    viewerCount: number;

    @Column('jsonb')
    quality: StreamQualityMetrics;

    @UpdateDateColumn()
    updatedAt: Date;
} 