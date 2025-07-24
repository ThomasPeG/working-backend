import { Injectable } from '@nestjs/common';
import { NotificationType } from '../types/notification.types';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationRabbitmqService } from './notification-rabbitmq.service';

@Injectable()
export class ConversationNotificationsService {
  constructor(private readonly notificationRabbitmqService: NotificationRabbitmqService) {}

  async sendNewMessageNotification(userId: string, senderName: string, messagePreview: string, conversationId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.NEW_MESSAGE,
      message: `${senderName}: ${messagePreview}`,
      metadata: { senderName, messagePreview, conversationId },
      read: false,
      relatedId: conversationId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendMessageReplyNotification(userId: string, senderName: string, replyPreview: string, conversationId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.MESSAGE_REPLY,
      message: `${senderName} respondió: ${replyPreview}`,
      metadata: { senderName, replyPreview, conversationId },
      read: false,
      relatedId: conversationId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendGroupMessageNotification(userId: string, senderName: string, groupName: string, messagePreview: string, groupId: string) {
    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.GROUP_MESSAGE,
      message: `${senderName} en ${groupName}: ${messagePreview}`,
      metadata: { senderName, groupName, messagePreview, groupId },
      read: false,
      relatedId: groupId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }

  async sendConversationStartedNotification({
    userId, conversationId, initiatorId, initiatorName, initiatorProfilePhoto}: 
    {userId: string, conversationId: string, initiatorId: string, initiatorName: string, initiatorProfilePhoto: string}) {

    const notification: CreateNotificationDto = {
      userId,
      type: NotificationType.CONVERSATION_STARTED,
      message: `${initiatorName} inició una conversación contigo`,
      metadata: { initiator:{id: initiatorId, name: initiatorName, profilePhoto: initiatorProfilePhoto} },
      read: false,
      relatedId: conversationId
    };
    return this.notificationRabbitmqService.createNotification(notification);
  }
}