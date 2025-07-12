import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  read?: boolean;
}