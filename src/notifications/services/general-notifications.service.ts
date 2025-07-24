import { Injectable } from '@nestjs/common';
import { NotificationType } from '../types/notification.types';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationRabbitmqService } from './notification-rabbitmq.service';

@Injectable()
export class GeneralNotificationsService {
  constructor(private readonly notificationRabbitmqService: NotificationRabbitmqService) {}

  async sendSystemNotification(userId: string, message: string, metadata?: any) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.SYSTEM,
      message,
      metadata,
      read: false
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendWelcomeNotification(userId: string, userName: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.WELCOME,
      message: `¡Bienvenido ${userName}! Tu cuenta ha sido creada exitosamente.`,
      metadata: { userName },
      read: false
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendAccountUpdateNotification(userId: string, updateType: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.ACCOUNT_UPDATE,
      message: `Tu ${updateType} ha sido actualizado exitosamente.`,
      metadata: { updateType },
      read: false
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendSecurityAlertNotification(userId: string, alertType: string, details?: any) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.SECURITY_ALERT,
      message: `Alerta de seguridad: ${alertType}`,
      metadata: { alertType, details },
      read: false
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendMaintenanceNotification(userId: string, maintenanceInfo: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.MAINTENANCE,
      message: `Mantenimiento programado: ${maintenanceInfo}`,
      metadata: { maintenanceInfo },
      read: false
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }
}