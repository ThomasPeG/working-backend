import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobCommentDocument = JobComment & Document;

@Schema({ timestamps: true })
export class JobComment {
  @Prop({ required: true })
  jobId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  likes: string[];
}

export const JobCommentSchema = SchemaFactory.createForClass(JobComment);