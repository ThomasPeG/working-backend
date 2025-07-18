import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PopularityMetricsDocument = PopularityMetrics & Document;

@Schema({ timestamps: true })
export class PopularityMetrics {
  @Prop({ required: true, index: true })
  targetType: string; // 'job', 'post', 'user'

  @Prop({ required: true, index: true })
  targetId: string;

  @Prop({ required: true, index: true })
  period: string; // 'daily', 'weekly', 'monthly'

  @Prop({ required: true, index: true })
  date: Date; // Fecha del período

  @Prop({ type: Object, default: {} })
  metrics: {
    views: number;
    clicks: number;
    applications: number;
    likes: number;
    shares: number;
    searches: number;
    uniqueUsers: number;
    totalInteractions: number;
    popularityScore: number; // Puntuación calculada
  };

  @Prop({ default: new Date() })
  lastUpdated: Date;
}

export const PopularityMetricsSchema = SchemaFactory.createForClass(PopularityMetrics);

// Índices para consultas rápidas de métricas
PopularityMetricsSchema.index({ targetType: 1, targetId: 1, period: 1, date: -1 });
PopularityMetricsSchema.index({ period: 1, date: -1, 'metrics.popularityScore': -1 });
PopularityMetricsSchema.index({ targetType: 1, period: 1, 'metrics.popularityScore': -1 });