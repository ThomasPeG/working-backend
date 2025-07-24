import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  countryId: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  population?: number;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isCapital?: boolean;
}