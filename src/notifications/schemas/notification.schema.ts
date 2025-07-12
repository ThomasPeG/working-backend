import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: null })
  data: any;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: String, default: null })
  relatedId: string;

  @Prop({ type: String, default: null })
  senderUserId: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Crear índices para búsquedas comunes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });