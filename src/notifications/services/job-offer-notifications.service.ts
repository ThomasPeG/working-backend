import { Injectable } from '@nestjs/common';
import { NotificationType } from '../types/notification.types';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationRabbitmqService } from './notification-rabbitmq.service';

@Injectable()
export class JobOfferNotificationsService {
  constructor(private readonly notificationRabbitmqService: NotificationRabbitmqService) {}

  async sendJobPostedNotification(userId: string, jobTitle: string, companyName: string, jobId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_POSTED,
      message: `Nueva oferta de trabajo: ${jobTitle} en ${companyName}`,
      metadata: { jobTitle, companyName, jobId },
      read: false,
      relatedId: jobId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendJobMatchNotification(userId: string, jobTitle: string, matchPercentage: number, jobId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_MATCH,
      message: `¡Coincidencia del ${matchPercentage}% con ${jobTitle}!`,
      metadata: { jobTitle, matchPercentage, jobId },
      read: false,
      relatedId: jobId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendJobRecommendedNotification(userId: string, jobTitle: string, reason: string, jobId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_RECOMMENDED,
      message: `Te recomendamos: ${jobTitle} - ${reason}`,
      metadata: { jobTitle, reason, jobId },
      read: false,
      relatedId: jobId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendJobDeadlineReminderNotification(userId: string, jobTitle: string, daysLeft: number, jobId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_DEADLINE_REMINDER,
      message: `Recordatorio: ${jobTitle} cierra en ${daysLeft} días`,
      metadata: { jobTitle, daysLeft, jobId },
      read: false,
      relatedId: jobId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendJobStatusUpdateNotification(userId: string, jobTitle: string, newStatus: string, jobId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_STATUS_UPDATE,
      message: `Actualización de ${jobTitle}: ${newStatus}`,
      metadata: { jobTitle, newStatus, jobId },
      read: false,
      relatedId: jobId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }
}