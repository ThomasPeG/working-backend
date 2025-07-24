import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { NotificationType } from '../types/notification.types';
import { EventsGateway } from 'src/events/events.gateway';

interface INotification {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: Record<string, any>;
  read: boolean;
  senderUserId?: string;
  relatedId?: string;
}

@Injectable()
export class NotificationRabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationRabbitmqService.name);
  private client: ClientProxy;

  constructor(
    private configService: ConfigService,
    private eventsGateway: EventsGateway
  ) {
    // Incluir credenciales en la URL de RabbitMQ
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'notifications_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.close();
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  async createNotification(notification: INotification) {
  this.client.send('create_notification', notification).subscribe({
    next: (response) => {
      this.eventsGateway.sendNotificationToUser(notification.userId, response.data);
      console.log('Notification sent successfully-----------:', response.data);
      console.log('Notification sent successfully============:', response);
     },
    error: (error) => {
      console.error('Error sending notification:', error);
     }
    })
  }

  async createSystemNotification(notification: INotification) {
    try {
      const result = await firstValueFrom(
        this.client.send('system_notification', notification).pipe(
          timeout(5000),
          catchError((error) => {
            this.logger.error('Error sending system notification:', error);
            throw error;
          })
        )
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to create system notification:', error);
      return { success: false, error: error.message };
    }
  }

  async markNotificationAsRead(notifications: INotification[]) {
    try {
      const result = await firstValueFrom(
        this.client.send('bulk_notifications', notifications).pipe(
          timeout(5000),
          catchError((error) => {
            this.logger.error('Error marking notifications as read:', error);
            throw error;
          })
        )
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to mark notifications as read:', error);
      return { success: false, error: error.message };
    }
  }
}