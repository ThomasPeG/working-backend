import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserInteractionDocument = UserInteraction & Document;

@Schema({ timestamps: true })
export class UserInteraction {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  eventType: string; // 'search', 'click', 'application', 'view', 'like', 'share'

  @Prop({ required: true, index: true })
  targetType: string; // 'job', 'post', 'user', 'message', 'general'

  @Prop({ index: true })
  targetId?: string; // ID del objeto interactuado (jobId, postId, etc.)

  @Prop({ type: Object })
  metadata?: {
    searchQuery?: string;
    category?: string;
    location?: { lat: number; lng: number };
    duration?: number; // tiempo en milisegundos
    source?: string; // 'home', 'search', 'profile', etc.
    deviceInfo?: {
      platform: string;
      version: string;
      model?: string;
    };
    additionalData?: any;
  };

  @Prop({ index: true })
  sessionId: string;

  @Prop({ default: new Date(), index: true })
  timestamp: Date;

  @Prop({ index: true })
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);

// Índices optimizados para consultas de analytics
UserInteractionSchema.index({ userId: 1, timestamp: -1 });
UserInteractionSchema.index({ eventType: 1, timestamp: -1 });
UserInteractionSchema.index({ targetType: 1, targetId: 1, timestamp: -1 });
UserInteractionSchema.index({ timestamp: -1 }); // Para consultas por fecha
UserInteractionSchema.index({ sessionId: 1, timestamp: 1 }); // Para análisis de sesión

// Índice compuesto para métricas de popularidad
UserInteractionSchema.index({ 
  targetType: 1, 
  targetId: 1, 
  eventType: 1, 
  timestamp: -1 
});