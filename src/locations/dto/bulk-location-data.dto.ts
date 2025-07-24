import { IsArray, ValidateNested, IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class CityDataDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
  isCapital?: boolean;
}

class CountryDataDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  code3: string;

  @IsString()
  @IsNotEmpty()
  continent: string;

  @IsString()
  @IsOptional()
  flag?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityDataDto)
  @IsOptional()
  cities?: CityDataDto[];
}

export class BulkLocationDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryDataDto)
  countries: CountryDataDto[];
}