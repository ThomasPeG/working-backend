import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';
import { Response } from '../interfaces/response.interface';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private usersService: UsersService,
  ) {}

  // Enviar un mensaje
  async sendMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Response> {
    // Verificar que el receptor exista
    await this.usersService.findOne(createMessageDto.receiverId);

    // Verificar que sean amigos (usando el servicio de usuarios)
    const areFriends = await this.usersService.checkFriendship(senderId, createMessageDto.receiverId);

    if (!areFriends) {
      throw new ForbiddenException('No puedes enviar mensajes a usuarios que no son tus amigos');
    }

    // Crear el mensaje
    const newMessage = new this.messageModel({
      senderId,
      receiverId: createMessageDto.receiverId,
      content: createMessageDto.content,
      attachments: createMessageDto.attachments || [],
    });

    const savedMessage = await newMessage.save();

    // Actualizar o crear la conversación
    const participants = [senderId, createMessageDto.receiverId].sort();
    
    await this.conversationModel.findOneAndUpdate(
      { participants: { $all: participants } },
      {
        participants,
        lastMessage: createMessageDto.content,
        lastMessageTime: new Date(),
        $inc: { [`unreadCount.${createMessageDto.receiverId}`]: 1 }
      },
      { upsert: true, new: true }
    );

    return {
      access_token: null,
      data: { message: savedMessage },
      message: 'Mensaje enviado exitosamente'
    };
  }

  // Obtener conversación con un usuario
  async getConversation(userId: string, friendId: string): Promise<Response> {
    // Verificar que el amigo exista
    await this.usersService.findOne(friendId);

    // Verificar que sean amigos
    const areFriends = await this.usersService.checkFriendship(userId, friendId);

    if (!areFriends) {
      throw new ForbiddenException('No puedes ver mensajes de usuarios que no son tus amigos');
    }

    // Obtener los mensajes entre ambos usuarios
    const messages = await this.messageModel.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 }).exec();

    // Marcar como leídos los mensajes recibidos
    await this.messageModel.updateMany(
      { senderId: friendId, receiverId: userId, read: false },
      { read: true }
    ).exec();

    // Resetear el contador de no leídos en la conversación
    const participants = [userId, friendId].sort();
    await this.conversationModel.findOneAndUpdate(
      { participants: { $all: participants } },
      { [`unreadCount.${userId}`]: 0 }
    ).exec();

    return {
      access_token: null,
      data: { messages },
      message: 'Conversación obtenida exitosamente'
    };
  }

  // Obtener todas las conversaciones del usuario
  async getConversations(userId: string): Promise<Response> {
    // Buscar todas las conversaciones donde el usuario es participante
    const conversations = await this.conversationModel.find({
      participants: userId
    }).sort({ lastMessageTime: -1 }).exec();

    // Obtener información de los usuarios para cada conversación
    const conversationsWithDetails = await Promise.all(conversations.map(async (conv) => {
      const friendId = conv.participants.find(id => id !== userId);
      if (!friendId) {
        throw new NotFoundException('Friend ID not found in conversation');
      }
      const friendResponse = await this.usersService.findOne(friendId);
      const friend = friendResponse.data.user;  // Acceder al usuario dentro de data
      
      return {  
        conversationId: conv._id,
        friend: {
          id: friend.id,
          name: friend.name,
          email: friend.email,
          profilePhoto: friend.profilePhoto
        },
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount[userId] || 0
      };
    }));

    return {
      access_token: null,
      data: { conversations: conversationsWithDetails },
      message: 'Conversaciones obtenidas exitosamente'
    };
  }

  // Obtener cantidad de mensajes no leídos
  async getUnreadCount(userId: string): Promise<Response> {
    const count = await this.messageModel.countDocuments({
      receiverId: userId,
      read: false
    }).exec();

    return {
      access_token: null,
      data: { unreadCount: count },
      message: 'Cantidad de mensajes no leídos obtenida exitosamente'
    };
  }
}