import { IsNotEmpty, IsString, IsOptional, IsObject, IsBoolean, IsEnum } from 'class-validator';
import { NotificationType } from '../types/notification.types';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsBoolean()
  read: boolean = false;

  @IsString()
  @IsOptional()
  senderId?: string;

  @IsString()
  @IsOptional()
  relatedId?: string;
}