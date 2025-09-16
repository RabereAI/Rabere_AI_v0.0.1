import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { RabereBehaviorData, RaberePosture } from '../interfaces/rabere-health.interface';

@Entity('rabere_health_records')
export class RabereHealthRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    deviceId: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column('float')
    movementFrequency: number;

    @Column('float')
    webBuildingFrequency: number;

    @Column('jsonb')
    feedingPattern: {
        lastFeedingTime: Date;
        preyType: string;
        feedingDuration: number;
        preyConsumptionRate: number;
    };

    @Column('jsonb')
    restingPeriods: {
        startTime: Date;
        endTime: Date;
        location: string;
        posture: raberePosture;
    }[];

    @Column('jsonb', { nullable: true })
    molting?: {
        startTime: Date;
        duration: number;
        oldExoskeletonSize: number;
        newExoskeletonSize: number;
        success: boolean;
    };
} 