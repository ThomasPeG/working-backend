// import { Injectable } from '@nestjs/common';
// import { NotificationRabbitmqService } from './services/notification-rabbitmq.service';
// import { KafkaClientService } from './services/kafka-client.service';
// import { NotificationType } from './types/notification.types';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     private notificationRabbitmq: NotificationRabbitmqService,
//     private kafkaClient: KafkaClientService,
//   ) {}

//   async dcreateNotification({userId, message, type, metadata}: {userId: string, message: string, type: NotificationType.JOB_POSTED, metadata?: any}) {
//     return this.notificationRabbitmq.createNotification({
//       userId,
//       message,
//       type,
//       metadata,
//     });
//   }

//   // async dgetUserNotifications(userId: string) {
//   //   return this.notificationRabbitmq.getUserNotifications(userId);
//   // }

//   async dmarkAsRead(id: string, userId: string) {
//     return this.notificationRabbitmq.markNotificationAsRead(id);
//   }

//   // Método para enviar notificaciones masivas usando Kafka
//   async dsendBulkNotifications(notifications: any[]) {
//     return this.kafkaClient.sendBulkNotifications(notifications);
//   }

//   // Método para enviar notificación de sistema a múltiples usuarios
//   async dsendSystemNotification(userIds: string[], message: string, metadata?: any) {
//     return this.kafkaClient.sendSystemNotification(userIds, message, metadata);
//   }

//   // Nuevas funciones implementadas

//   /**
//    * Encuentra todas las notificaciones para un usuario con paginación
//    */
//   async dfindAllForUser(userId: string, limit: number = 10, page: number = 1) {
//     return this.notificationRabbitmq.send('get_user_notifications_paginated', {
//       userId,
//       limit,
//       page
//     }).toPromise();
//   }

//   /**
//    * Encuentra todas las notificaciones no leídas para un usuario
//    */
//   async dfindUnreadForUser(userId: string) {
//     return this.notificationRabbitmq.send('get_unread_notifications', {
//       userId
//     }).toPromise();
//   }

//   /**
//    * Marca todas las notificaciones de un usuario como leídas
//    */
//   async dmarkAllAsRead(userId: string) {
//     return this.notificationRabbitmq.send('mark_all_notifications_read', {
//       userId
//     }).toPromise();
//   }

//   /**
//    * Elimina una notificación específica para un usuario
//    */
//   async dremove(id: string, userId: string) {
//     return this.notificationRabbitmq.send('remove_notification', {
//       id,
//       userId
//     }).toPromise();
//   }

//   /**
//    * Elimina todas las notificaciones de un usuario
//    */
//   async dremoveAllForUser(userId: string) {
//     return this.notificationRabbitmq.send('remove_all_notifications', {
//       userId
//     }).toPromise();
//   }
// }