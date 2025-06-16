import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Job description is required' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Schedule is required' })
  schedule: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salary?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  requiredExperience?: number;

  @IsString()
  @IsOptional()
  requiredEducation?: string;

  @IsNumber()
  @IsOptional()
  @Min(18, { message: 'Minimum age must be at least 18' })
  @Max(100, { message: 'Maximum age must be reasonable' })
  requiredAge?: number;

  @IsOptional()
  location?: any; // Using any for JSON type

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}