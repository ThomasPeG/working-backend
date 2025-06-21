import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobTypeDocument = JobType & Document;

@Schema({ timestamps: true })
export class JobType {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: String })
  description: string;
  
  @Prop({ type: String, index: true })
  stemmed: string;
  
  @Prop({ type: [String], default: [] })
  synonyms: string[];
}

export const JobTypeSchema = SchemaFactory.createForClass(JobType);

// Crear índice para búsquedas eficientes
JobTypeSchema.index({ name: 'text', category: 'text', stemmed: 'text', synonyms: 'text' });