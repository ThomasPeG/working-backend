import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del usuario a calificar es requerido' })
  receiverId: string;

  @IsNumber({}, { message: 'La calificación debe ser un número' })
  @Min(1, { message: 'La calificación mínima es 1.0' })
  @Max(5, { message: 'La calificación máxima es 5.0' })
  @IsNotEmpty({ message: 'La calificación es requerida' })
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  context?: string = 'general'; // 'job', 'service', 'general'
}