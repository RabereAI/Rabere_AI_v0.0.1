import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Anomaly } from '../../../shared/interfaces/analytics.interface';

@Entity('analytics_data')
export class AnalyticsData {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    deviceId: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column('jsonb')
    behaviorMetrics: {
        aggressionLevel: number;
        hydrophobiaScore: number;
        coordinationScore: number;
    };

    @Column('jsonb')
    anomalies: Anomaly[];

    @Column()
    alertLevel: string;
} 