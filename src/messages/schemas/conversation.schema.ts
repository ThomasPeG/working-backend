import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  participants: string[];

  @Prop({ default: null })
  lastMessage: string;

  @Prop({ default: Date.now })
  lastMessageTime: Date;

  @Prop({ type: Object, default: {} })
  unreadCount: Record<string, number>;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Crear índice para buscar conversaciones por participantes
ConversationSchema.index({ participants: 1 });