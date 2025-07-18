import { IsString, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class AssignUserToContractDto {
  @IsUUID()
  userId: string;

  @IsEnum(['employee', 'contractor', 'manager', 'supervisor', 'client'])
  role: string;

  @IsNumber()
  @IsOptional()
  individualSalary?: number;

  @IsString()
  @IsOptional()
  salaryFrequency?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}