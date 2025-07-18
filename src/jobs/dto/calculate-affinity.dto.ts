import { IsString, IsOptional, IsObject, IsNumber, Min, Max } from 'class-validator';

export class CalculateAffinityDto {
  @IsString()
  userId: string;

  @IsString()
  jobId: string;

  @IsOptional()
  @IsObject()
  customWeights?: {
    availability?: number;
    location?: number;
    languages?: number;
    interests?: number;
    experience?: number;
    education?: number;
    skills?: number;
    schedule?: number;
    salary?: number;
    age?: number;
    rating?: number;
    membership?: number;
  };
}

export class GetCandidatesDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minAffinityPercentage?: number = 30;
}