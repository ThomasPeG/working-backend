import { Injectable } from '@nestjs/common';
import { NotificationType } from '../types/notification.types';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationRabbitmqService } from './notification-rabbitmq.service';

@Injectable()
export class FriendRequestNotificationsService {
  constructor(private readonly notificationRabbitmqService: NotificationRabbitmqService) {}

  async sendFriendRequestNotification({
    userId,
    requesterName,
    requesterId,
    requestId,
    requesterProfilePhoto
  }: {
    userId: string,
    requesterName: string,
    requesterId: string,
    requestId: string,
    requesterProfilePhoto: string
  }) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.FRIEND_REQUEST_RECEIVED,
      message: `${requesterName} te envió una solicitud de amistad`,
      metadata: { requester:{id: requesterId, name: requesterName, profilePhoto: requesterProfilePhoto} },
      read: false,
      relatedId: requestId,
      senderId: requesterId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendFriendRequestStatusNotification(userId: string, responseUserName: string, responseUserId: string, friendshipId: string, status: string) {

    const notificationType = status === 'rejected' ? NotificationType.FRIEND_REQUEST_DECLINED : NotificationType.FRIEND_REQUEST_ACCEPTED;

    const notification: CreateNotificationDto = {
      userId,
      type: notificationType,
      message: `${responseUserName} ${status === 'rejected' ? 'rechazó' : 'aceptó'} tu solicitud de amistad`,
      metadata: { responseUserName, responseUserId, friendshipId },
      read: false,
      relatedId: friendshipId,
      senderId: responseUserId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendConnectionSuggestionNotification(userId: string, suggestedUserName: string, suggestedUserId: string, reason: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.CONNECTION_SUGGESTION,
      message: `Te sugerimos conectar con ${suggestedUserName} - ${reason}`,
      metadata: { suggestedUserName, suggestedUserId, reason },
      read: false,
      relatedId: suggestedUserId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }
}