import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CountryDocument = Country & Document;

@Schema({ timestamps: true })
export class Country {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string; // ISO 3166-1 alpha-2 (ej: "ES", "US", "MX")

  @Prop({ required: true, unique: true })
  code3: string; // ISO 3166-1 alpha-3 (ej: "ESP", "USA", "MEX")

  @Prop({ required: true })
  continent: string;

  @Prop()
  flag?: string; // URL de la bandera

  @Prop()
  currency?: string;

  @Prop()
  language?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CountrySchema = SchemaFactory.createForClass(Country);

// Índices para optimizar búsquedas
CountrySchema.index({ name: 1 });
CountrySchema.index({ code: 1 });
CountrySchema.index({ continent: 1 });