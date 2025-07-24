import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCountryDto {
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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}