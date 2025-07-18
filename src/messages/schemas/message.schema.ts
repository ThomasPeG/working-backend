import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Enum para tipos de mensaje
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  LINK = 'link'
}

// Interfaz para vista previa de enlaces
export interface LinkPreview {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  // NUEVOS CAMPOS MULTIMEDIA
  @Prop({ enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Prop({ required: false })
  mediaUrl?: string;

  @Prop({ required: false })
  fileName?: string;

  @Prop({ type: Object, required: false })
  linkPreview?: LinkPreview;

  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Índices compuestos para optimizar consultas
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1, read: 1 });
MessageSchema.index({ receiverId: 1, read: 1 }); // Para mensajes no leídos
MessageSchema.index({ type: 1 }); // Para filtrar por tipo de mensaje