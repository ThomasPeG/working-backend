import { IsString, IsOptional, IsEnum, IsNumber, IsDate, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['full-time', 'part-time', 'freelance', 'internship', 'temporary'])
  type: string;

  @IsEnum(['draft', 'active', 'completed', 'cancelled', 'suspended'])
  @IsOptional()
  status?: string = 'draft';

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsNumber()
  @IsOptional()
  totalBudget?: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsEnum(['hours', 'days', 'weeks', 'months', 'years'])
  @IsOptional()
  durationUnit?: string;

  @IsString()
  @IsOptional()
  workLocation?: string;

  @IsEnum(['remote', 'on-site', 'hybrid'])
  @IsOptional()
  workType?: string;

  @IsArray()
  @IsOptional()
  requiredSkills?: string[];

  @IsString()
  @IsOptional()
  terms?: string;

  @IsString()
  @IsOptional()
  conditions?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsString()
  @IsOptional()
  createdBy?: string;
}