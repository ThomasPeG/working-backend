import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'JobType', default: null })
  jobType?: Types.ObjectId;  // ID del JobType (opcional)

  @Prop({ type: String, default: null })
  jobTypeNew?: string;  // NUEVO - Nombre personalizado cuando jobType es null (opcional)
  
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

  @Prop({ type: Boolean, default: false })
  requiredExperience: boolean;

  @Prop({ type: Boolean, default: false })
  requiredEducation: boolean;

  @Prop({ type: Number, default: null })
  requiredAge: number;

  @Prop({ type: String, default: null })
  contractType: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true, index: true })  // Agregado index: true aquí
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ default: 0 })
  sharesCount: number;

  // Nuevos campos para ubicación estructurada
  @Prop({ type: Types.ObjectId, ref: 'Country' })
  locationCountryId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'City' })
  locationCityId?: Types.ObjectId;

  // Mantener campo legacy
  @Prop()
  place?: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// Índices optimizados para mejorar rendimiento
// Índice principal para findAll() - trabajos activos ordenados por fecha
JobSchema.index({ isActive: 1, createdAt: -1 });

// Índice para findByUserId() - trabajos de usuario específico ordenados por fecha
JobSchema.index({ userId: 1, createdAt: -1 });

// Índice para búsquedas por tipo de trabajo
JobSchema.index({ jobType: 1, isActive: 1 });

// Índice para búsquedas por ubicación (si se implementa en el futuro)
JobSchema.index({ place: 1, isActive: 1 });