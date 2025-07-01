import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobShareDto {
  @IsString()
  @IsNotEmpty({ message: 'Job ID is required' })
  jobId: string;

  @IsString()
  @IsOptional()
  sharedTo?: string;
}