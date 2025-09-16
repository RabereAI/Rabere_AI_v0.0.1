import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Point3D, MovementMetrics, WebBuildingMetrics, VisionAnomaly } from '../interfaces/vision-analysis.interface';
import { RaberePosture } from '../interfaces/rabere-health.interface';
import { FeedingMetrics, RestingPeriod } from '../interfaces/rabere-health.interface';

@Entity('vision_analysis_results')
export class VisionAnalysisResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    deviceId: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column()
    rabereDetected: boolean;

    @Column('jsonb')
    rabereLocation: Point3D;

    @Column({
        type: 'enum',
        enum: RaberePosture
    })
    posture: RaberePosture;

    @Column('jsonb')
    movementMetrics: MovementMetrics;

    @Column('jsonb')
    webBuildingMetrics: WebBuildingMetrics;

    @Column('jsonb')
    feedingMetrics: FeedingMetrics;

    @Column('jsonb')
    restingPeriods: RestingPeriod[];

    @Column('jsonb')
    anomalies: VisionAnomaly[];
} 