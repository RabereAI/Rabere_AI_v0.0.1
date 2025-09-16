import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { PredictionType } from '../../../shared/interfaces/ml-analytics.interface';

@Entity('ml_predictions')
export class MLPredictionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    deviceId: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column({
        type: 'enum',
        enum: PredictionType
    })
    predictionType: PredictionType;

    @Column('float')
    confidence: number;

    @Column('jsonb')
    predictedValues: {
        aggressionScore?: number;
        hydrophobiaScore?: number;
        coordinationScore?: number;
        riskLevel?: string;
        symptoms?: string[];
    };
} 