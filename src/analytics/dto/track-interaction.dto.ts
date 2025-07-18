import { IsString, IsOptional, IsObject, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeviceInfoDto {
  @IsString()
  platform: string;

  @IsString()
  version: string;

  @IsOptional()
  @IsString()
  model?: string;
}

export class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class MetadataDto {
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;

  @IsOptional()
  @IsObject()
  additionalData?: any;
}

export class TrackInteractionDto {
  @IsString()
  eventType: string; // 'search', 'click', 'application', 'view', 'like', 'share'

  @IsString()
  targetType: string; // 'job', 'post', 'user', 'message', 'general'

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}