import { ConversationNotificationsService } from './../notifications/services/conversation-notifications.service';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { CreateMessageDto, MessageType } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';
import { Response } from '../interfaces/response.interface';
import { EventsGateway } from '../events/events.gateway';
import { NotificationRabbitmqService } from 'src/notifications/services/notification-rabbitmq.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private usersService: UsersService,
    private eventsGateway: EventsGateway,
    private conversationNotificationsService: ConversationNotificationsService
  ) {}

  // 1. Enviar un mensaje - Solo guarda y actualiza lastMessage
  async sendMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Response> {
    
    // Verificar que el receptor exista
    const receiverResponse = await this.usersService.findOne(createMessageDto.receiverId);
    const receiver = receiverResponse.data.user;
    
    // Verificar que el remitente exista
    const senderResponse = await this.usersService.findOne(senderId);
    const sender = senderResponse.data.user;

    // Verificar que sean amigos
    const areFriends = await this.usersService.checkFriendship(senderId, createMessageDto.receiverId);

    if (!areFriends) {
      throw new ForbiddenException('No puedes enviar mensajes a usuarios que no son tus amigos');
    }

    // Crear el mensaje con los nuevos campos multimedia
    const newMessage = new this.messageModel({
      senderId,
      receiverId: createMessageDto.receiverId,
      content: createMessageDto.content,
      attachments: createMessageDto.attachments || [],
      type: createMessageDto.type || 'text', // Default a texto
      mediaUrl: createMessageDto.mediaUrl,
      fileName: createMessageDto.fileName,
      linkPreview: createMessageDto.linkPreview,
      read: false
    });

    const savedMessage = await newMessage.save();
  
    const participants = [senderId, createMessageDto.receiverId].sort();
  
    // Validar si la conversación existe y usar Create o Update según corresponda
    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: participants }
    }).exec();

    if (existingConversation) {
      // La conversación ya existe - ACTUALIZAR
      await this.conversationModel.findByIdAndUpdate(
        existingConversation._id,
        {
          $set: { 
            lastMessage: [savedMessage._id],
            updatedAt: new Date()
          },
          $inc: { [`unreadCount.${createMessageDto.receiverId}`]: 1 }
        },
        { new: true }
      ).exec();
    } else {
      // La conversación no existe - CREAR
      const newConversation = new this.conversationModel({
        participants,
        lastMessage: [savedMessage._id],
        unreadCount: {
          [createMessageDto.receiverId]: 1,
          [senderId]: 0
        }
      });
      await newConversation.save();
      if(newConversation._id) {
        this.conversationNotificationsService.sendConversationStartedNotification(
          {
            userId: createMessageDto.receiverId,
            conversationId: newConversation._id.toString(),
            initiatorId: sender._id,
            initiatorName: sender.name,
            initiatorProfilePhoto: sender.profilePhoto,
          }
        )
      }
    }
  
    // Enviar mensaje al receptor
    this.eventsGateway.sendNewMessage(createMessageDto.receiverId, savedMessage);
  
    return {
      access_token: null,
      data: { message: savedMessage },
      message: 'Mensaje enviado exitosamente'
    };
  }

  // 2. Marcar un mensaje como leído
  async markAsRead(userId: string, messageId: string): Promise<Response> {
    try {
      // Buscar el mensaje
      const message = await this.messageModel.findById(messageId).exec();
      if (!message) {
        throw new NotFoundException('Mensaje no encontrado');
      }

      // Verificar que el usuario sea el receptor del mensaje
      if (message.receiverId !== userId) {
        throw new ForbiddenException('No puedes marcar como leído un mensaje que no es tuyo');
      }

      // Marcar el mensaje como leído
      const updatedMessage = await this.messageModel.findByIdAndUpdate(
        messageId,
        { read: true },
        { new: true }
      ).exec();

      // Buscar la conversación y actualizar unreadCount
      const participants = [message.senderId, message.receiverId].sort();
      await this.conversationModel.findOneAndUpdate(
        { participants: { $all: participants } },
        { [`unreadCount.${userId}`]: 0 },
        { new: true }
      ).exec();

      // Enviar solo el mensaje actualizado al remitente
      this.eventsGateway.sendMessageRead(
        message.senderId,
        {
          _id: updatedMessage!._id,
          senderId: updatedMessage!.senderId,
          receiverId: updatedMessage!.receiverId,
          content: updatedMessage!.content,
          attachments: updatedMessage!.attachments,
          type: updatedMessage!.type, // NUEVO
          mediaUrl: updatedMessage!.mediaUrl, // NUEVO
          fileName: updatedMessage!.fileName, // NUEVO
          linkPreview: updatedMessage!.linkPreview, // NUEVO
          read: updatedMessage!.read,
          createdAt: updatedMessage!.createdAt,
          updatedAt: updatedMessage!.updatedAt
        }
      );

      return {
        access_token: null,
        data: { message: updatedMessage },
        message: 'Mensaje marcado como leído exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Error al marcar el mensaje como leído');
    }
  }

  // 3. Obtener conversaciones con lastMessage data y unreadCount filtrado
  async getConversations(userId: string): Promise<Response> {
    const conversations = await this.conversationModel
      .find({ participants: userId })
      .populate('lastMessage')
      .sort({ updatedAt: -1 }) // Más recientes primero
      .exec();
  
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const friendId = conv.participants.find(id => id !== userId);
        const friendResponse = await this.usersService.findOne(friendId!);
        const friend = friendResponse.data.user;
        
        return {
          conversationId: conv._id,
          participants: conv.participants,
          friend: {
            id: friend.id,
            name: friend.name,
            email: friend.email,
            profilePhoto: friend.profilePhoto
          },
          lastMessage: conv.lastMessage[0] || null,
          unreadCount: conv.unreadCount[userId] || 0,
        };
      })
    );
  
    return {
      access_token: null,
      data: { conversations: conversationsWithDetails },
      message: 'Conversaciones obtenidas exitosamente'
    };
  }

  // 4. Obtener mensajes de una conversación
  // Método optimizado para obtener mensajes con paginación
  async getMessages(userId: string, friendId: string, page: number = 1, limit: number = 50): Promise<Response> {
    // Verificar amistad
    const areFriends = await this.usersService.checkFriendship(userId, friendId);
    if (!areFriends) {
      throw new ForbiddenException('No puedes ver mensajes de usuarios que no son tus amigos');
    }
  
    // Consulta directa con paginación
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      })
      .sort({ createdAt: -1 }) // Más recientes primero
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  
    // Contar total de mensajes
    const totalMessages = await this.messageModel.countDocuments({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    });
  
    // Marcar mensajes no leídos como leídos
    await this.markUnreadMessagesAsRead(userId, friendId);
  
    const friendResponse = await this.usersService.findOne(friendId);
    const friend = friendResponse.data.user;
  
    return {
      access_token: null,
      data: {
        messages: messages.reverse(), // Invertir para mostrar cronológicamente
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNextPage: page < Math.ceil(totalMessages / limit),
          hasPrevPage: page > 1
        },
        friend: {
          id: friend.id,
          name: friend.name,
          email: friend.email,
          profilePhoto: friend.profilePhoto
        }
      },
      message: 'Mensajes obtenidos exitosamente'
    };
  }

  // 5. Función separada para marcar mensajes no leídos como leídos
  private async markUnreadMessagesAsRead(userId: string, friendId: string): Promise<void> {
    // Buscar mensajes no leídos que el usuario recibió (no los que envió)
    const unreadMessages = await this.messageModel.find({
      senderId: friendId,
      receiverId: userId,
      read: false
    }).exec();
  
    if (unreadMessages.length > 0) {
      // Marcar todos como leídos
      await this.messageModel.updateMany(
        {
          senderId: friendId,
          receiverId: userId,
          read: false
        },
        { read: true }
      ).exec();
  
      // Obtener los mensajes actualizados
      const readMessages = await this.messageModel.find({
        _id: { $in: unreadMessages.map(msg => msg._id) }
      }).exec();
  
      // Buscar la conversación dinámicamente y actualizar unreadCount
      const participants = [userId, friendId].sort();
      await this.conversationModel.findOneAndUpdate(
        { participants: { $all: participants } },
        { [`unreadCount.${userId}`]: 0 },
        { new: true }
      ).exec();
  
      // Enviar solo los mensajes modificados al remitente
      this.eventsGateway.sendMessagesRead(
        friendId,
        readMessages.map(msg => ({
          _id: msg._id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          attachments: msg.attachments,
          read: msg.read,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt
        }))
      );
    }
  }
}