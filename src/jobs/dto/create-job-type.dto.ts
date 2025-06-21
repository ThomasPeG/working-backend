import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateJobTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del tipo de trabajo es requerido' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La categoría del tipo de trabajo es requerida' })
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}