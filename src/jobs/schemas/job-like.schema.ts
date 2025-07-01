import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobLikeDocument = JobLike & Document;

@Schema({ timestamps: true })
export class JobLike {
  @Prop({ required: true })
  jobId: string;

  @Prop({ required: true, index: true })
  userId: string;
}

export const JobLikeSchema = SchemaFactory.createForClass(JobLike);

// Crear índice compuesto para búsquedas más eficientes
JobLikeSchema.index({ jobId: 1, userId: 1 }, { unique: true });