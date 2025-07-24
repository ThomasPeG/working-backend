import { Injectable } from '@nestjs/common';
import { NotificationType } from '../types/notification.types';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationRabbitmqService } from './notification-rabbitmq.service';

@Injectable()
export class JobInvitationNotificationsService {
  constructor(private readonly notificationRabbitmqService: NotificationRabbitmqService) {}

  async sendJobInvitationReceivedNotification(userId: string, companyName: string, jobTitle: string, invitationId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_INVITATION_RECEIVED,
      message: `${companyName} te invitó a aplicar para ${jobTitle}`,
      metadata: { companyName, jobTitle, invitationId },
      read: false,
      relatedId: invitationId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendJobApplicationReceivedNotification(userId: string, applicantName: string, jobTitle: string, applicationId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_APPLICATION_RECEIVED,
      message: `${applicantName} aplicó para ${jobTitle}`,
      metadata: { applicantName, jobTitle, applicationId },
      read: false,
      relatedId: applicationId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendJobApplicationAcceptedNotification(userId: string, companyName: string, jobTitle: string, applicationId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_APPLICATION_ACCEPTED,
      message: `¡${companyName} aceptó tu aplicación para ${jobTitle}!`,
      metadata: { companyName, jobTitle, applicationId },
      read: false,
      relatedId: applicationId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendJobApplicationRejectedNotification(userId: string, companyName: string, jobTitle: string, applicationId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.JOB_APPLICATION_REJECTED,
      message: `${companyName} no seleccionó tu aplicación para ${jobTitle}`,
      metadata: { companyName, jobTitle, applicationId },
      read: false,
      relatedId: applicationId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendInterviewScheduledNotification(userId: string, companyName: string, jobTitle: string, interviewDate: Date, interviewId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.INTERVIEW_SCHEDULED,
      message: `Entrevista programada con ${companyName} para ${jobTitle} el ${interviewDate.toLocaleDateString()}`,
      metadata: { companyName, jobTitle, interviewDate, interviewId },
      read: false,
      relatedId: interviewId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendInterviewReminderNotification(userId: string, companyName: string, jobTitle: string, hoursUntilInterview: number, interviewId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.INTERVIEW_REMINDER,
      message: `Recordatorio: Entrevista con ${companyName} para ${jobTitle} en ${hoursUntilInterview} horas`,
      metadata: { companyName, jobTitle, hoursUntilInterview, interviewId },
      read: false,
      relatedId: interviewId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }
}