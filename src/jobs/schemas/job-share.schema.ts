import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobShareDocument = JobShare & Document;

@Schema({ timestamps: true })
export class JobShare {
  @Prop({ required: true })
  jobId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ type: String, default: null })
  sharedTo: string;
}

export const JobShareSchema = SchemaFactory.createForClass(JobShare);
JobShareSchema.index({ jobId: 1, userId: 1 }, { unique: true });