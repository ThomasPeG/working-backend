import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsObject, IsUrl } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  place?: string;

  @IsString()
  @IsOptional()
  jobType?: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsString()
  @IsOptional()
  timeCommitment?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsString()
  @IsOptional()
  salaryCycle?: string;

  @IsArray()
  @IsOptional()
  requiredLanguages?: string[];

  @IsBoolean()
  @IsOptional()
  requiredExperience?: boolean;

  @IsBoolean()
  @IsOptional()
  requiredEducation?: boolean;

  @IsNumber()
  @IsOptional()
  requiredAge?: number;

  @IsString()
  @IsOptional()
  contractType?: string;
  
  @IsArray()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}