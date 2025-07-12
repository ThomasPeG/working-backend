import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, type: [String] })
  participants: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  lastMessage: Types.ObjectId[]; // Solo el último mensaje

  @Prop({ type: Object, default: {} })
  unreadCount: Record<string, number>;

  // Eliminar el array messages - ya no es necesario
  // @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  // messages: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Índices para optimizar consultas
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ 'participants': 1, 'updatedAt': -1 });