import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { EnvironmentParameters } from '../interfaces/device-control.interface';

@Entity()
export class TelemetryRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    deviceId: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column('jsonb')
    parameters: EnvironmentParameters;

    @Column('jsonb', { nullable: true })
    metadata: Record<string, any>;
}

export interface TelemetryRecord {
    id: string;
    deviceId: string;
    timestamp: Date;
    parameters: BehaviorParameters;
    metadata: RecordMetadata;
}

export interface BehaviorParameters {
    aggressionLevel: number;
    hydrophobiaScore: number;
    coordinationScore: number;
    movementPattern: string;
    alertLevel: string;
}

export interface RecordMetadata {
    videoReference?: string;
    location?: string;
    deviceType: string;
    recordingDuration: number;
} 