import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

enum EducationType {
  HIGHSCHOOL = 'highschool',
  TECHNICAL = 'technical',
  BACHELOR = 'bachelor',
  MASTER = 'master',
  DOCTORATE = 'doctorate',
  OTHER = 'other'
}

export class CreateEducationDto {

  @IsString()
  @IsOptional()
  educationType?: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsString()
  @IsOptional()
  fieldOfStudy?: string;

  @IsNumber()
  @IsOptional()
  timeStudying?: number;

  @IsDateString()
  @IsOptional()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  currentlyStudying?: boolean = false;
}