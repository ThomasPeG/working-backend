import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateExperienceDto } from '../experience/create-experience.dto';
import { CreateEducationDto } from '../education/create-education.dto';

export class CreateEmployeeDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  cv?: string;

  @IsArray()
  @IsOptional()
  jobInterests?: string[];

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsArray()
  @IsOptional()
  experiences?: CreateExperienceDto[];

  @IsArray()
  @IsOptional()
  education?: CreateEducationDto[];
}