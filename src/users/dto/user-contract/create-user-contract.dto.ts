import { IsString, IsOptional, IsEnum, IsNumber, IsDate, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserContractDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  contractId: string;

  @IsEnum(['employee', 'contractor', 'manager', 'supervisor', 'client'])
  role: string;

  @IsNumber()
  @IsOptional()
  individualSalary?: number;

  @IsString()
  @IsOptional()
  salaryFrequency?: string; // 'hourly', 'daily', 'weekly', 'monthly', 'yearly'

  @IsEnum(['pending', 'accepted', 'rejected', 'active', 'completed', 'terminated'])
  @IsOptional()
  status?: string = 'pending';

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  joinedAt?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  leftAt?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}