import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Country } from './country.schema';

export type CityDocument = City & Document;

@Schema({ timestamps: true })
export class City {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId: Types.ObjectId;

  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;

  @Prop()
  population?: number;

  @Prop()
  timezone?: string;

  @Prop()
  region?: string; // Estado, provincia, región

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  isCapital?: boolean;
}

export const CitySchema = SchemaFactory.createForClass(City);

// Índices para optimizar búsquedas
CitySchema.index({ name: 1 });
CitySchema.index({ countryId: 1 });
CitySchema.index({ name: 1, countryId: 1 }, { unique: true });
CitySchema.index({ latitude: 1, longitude: 1 });
CitySchema.index({ population: -1 });