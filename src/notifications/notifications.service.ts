import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Response } from 'src/interfaces/response.interface';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private eventsGateway: EventsGateway, // Inyectamos el gateway
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Response> {
    const newNotification = new this.notificationModel(createNotificationDto);
    const savedNotification = await newNotification.save();
    
    // Enviar la notificación en tiempo real al usuario
    this.eventsGateway.sendNotificationToUser(
      createNotificationDto.userId,
      savedNotification
    );
    
    return {
      access_token: null,
      data: { notification: savedNotification },
      message: 'Notification created successfully',
    };
  }

  async findAllForUser(userId: string, limit: number = 10, page: number = 1): Promise<Response> {
    // Calcular el número de documentos a saltar
    const skip = (page - 1) * limit;
    
    // Obtener el total de notificaciones para el usuario
    const total = await this.notificationModel.countDocuments({ userId }).exec();
    
    // Obtener las notificaciones con paginación
    const notifications = await this.notificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    return {
      access_token: null,
      data: { 
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Notifications retrieved successfully',
    };
  }

  async findUnreadForUser(userId: string): Promise<Response> {
    const notifications = await this.notificationModel.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .exec();
    
    return {
      access_token: null,
      data: { notifications },
      message: 'Unread notifications retrieved successfully',
    };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Response> {
    const notification = await this.findOne(id);
    
    // Verificar que la notificación pertenece al usuario
    if (notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${id} not found for this user`);
    }
    
    const updatedNotification = await this.notificationModel.findByIdAndUpdate(
      id, 
      updateNotificationDto, 
      { new: true }
    ).exec();
    
    return {
      access_token: null,
      data: { notification: updatedNotification },
      message: 'Notification updated successfully',
    };
  }

  async markAsRead(id: string, userId: string): Promise<Response> {
    const result = await this.update(id, userId, { read: true });
    
    // Notificar al cliente que la notificación ha sido marcada como leída
    if (result.data?.notification) {
      this.eventsGateway.sendNotificationToUser(userId, {
        type: 'notification_read',
        notificationId: id
      });
    }
    
    return result;
  }

  async markAllAsRead(userId: string): Promise<Response> {
    await this.notificationModel.updateMany(
      { userId, read: false },
      { read: true }
    ).exec();
    
    // Notificar al cliente que todas las notificaciones han sido marcadas como leídas
    this.eventsGateway.sendNotificationToUser(userId, {
      type: 'all_notifications_read'
    });
    
    return {
      access_token: null,
      data: null,
      message: 'All notifications marked as read',
    };
  }

  async remove(id: string, userId: string): Promise<Response> {
    const notification = await this.findOne(id);
    
    // Verificar que la notificación pertenece al usuario
    if (notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${id} not found for this user`);
    }
    
    await this.notificationModel.findByIdAndDelete(id).exec();
    
    return {
      access_token: null,
      data: null,
      message: 'Notification deleted successfully',
    };
  }

  async removeAllForUser(userId: string): Promise<Response> {
    await this.notificationModel.deleteMany({ userId }).exec();
    
    return {
      access_token: null,
      data: null,
      message: 'All notifications deleted successfully',
    };
  }
}