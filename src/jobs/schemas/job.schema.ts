import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, default: null })
  place: string;

  @Prop({ type: String, default: null })
  jobType: string;
  
  @Prop({ type: String, default: null })
  salary: number;

  @Prop({ type: String, default: null })
  salaryCycle: string;

  @Prop({ type: String, default: null })
  schedule: string;

  @Prop({ type: String, default: null })
  timeCommitment: string;

  @Prop({ type: [String], default: [] })
  requiredLanguages: string[];

  @Prop({ type: String, default: false })
  requiredExperience: boolean;

  @Prop({ type: String, default: false })
  requiredEducation: boolean;

  @Prop({ type: Number, default: null })
  requiredAge: number;

  @Prop({ type: String, default: null })
  contractType: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ default: 0 })
  sharesCount: number;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// Crear índice compuesto para búsquedas más comunes
JobSchema.index({ userId: 1, createdAt: -1 });