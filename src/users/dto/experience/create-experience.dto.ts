import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty({ message: 'Job position is required' })
  position: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  currentlyWorking?: boolean = false;
}