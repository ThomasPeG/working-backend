import { IsOptional, IsEnum, IsString, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ContractFilterDto {
  @IsEnum(['full-time', 'part-time', 'freelance', 'internship', 'temporary'])
  @IsOptional()
  type?: string;

  @IsEnum(['draft', 'active', 'completed', 'cancelled', 'suspended'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDateFrom?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDateTo?: Date;

  @IsEnum(['remote', 'on-site', 'hybrid'])
  @IsOptional()
  workType?: string;

  @IsNumber()
  @IsOptional()
  minBudget?: number;

  @IsNumber()
  @IsOptional()
  maxBudget?: number;

  @IsString()
  @IsOptional()
  createdBy?: string;
}