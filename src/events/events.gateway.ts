import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketResponse } from '../interfaces/response.interface';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, limita esto a tus dominios frontend
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('EventsGateway');
  private userSocketMap: Map<string, string> = new Map(); // userId -> socketId
  private socketUserMap: Map<string, string> = new Map(); // socketId -> userId

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Eliminar el mapeo cuando el usuario se desconecta
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
    }
  }

  @SubscribeMessage('identity')
  handleIdentity(client: Socket, payload: { userId: string }) {
    
    // Guardar la relación entre userId y socketId
    this.userSocketMap.set(payload.userId, client.id);
    this.socketUserMap.set(client.id, payload.userId);
    
    const response: SocketResponse = {
      event: 'identity',
      data: { userId: payload.userId, socketId: client.id },
      message: `Identity attached: ${payload.userId}`,
      timestamp: new Date(),
      success: true
    };
    
    return response;
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, payload: { conversationId: string }) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) {
      const errorResponse: SocketResponse = {
        event: 'joinConversation',
        data: { error: 'Usuario no identificado' },
        message: 'Error: Usuario no identificado',
        timestamp: new Date(),
        success: false
      };
      return errorResponse;
    }

    client.join(`conversation_${payload.conversationId}`);
    this.logger.log(`User ${userId} joined conversation ${payload.conversationId}`);
    
    const response: SocketResponse = {
      event: 'joinConversation',
      data: { 
        conversationId: payload.conversationId,
        userId: userId
      },
      message: `Te has unido a la conversación ${payload.conversationId}`,
      timestamp: new Date(),
      success: true
    };
    
    return response;
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(client: Socket, payload: { conversationId: string }) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) {
      const errorResponse: SocketResponse = {
        event: 'leaveConversation',
        data: { error: 'Usuario no identificado' },
        message: 'Error: Usuario no identificado',
        timestamp: new Date(),
        success: false
      };
      return errorResponse;
    }

    client.leave(`conversation_${payload.conversationId}`);
    this.logger.log(`User ${userId} left conversation ${payload.conversationId}`);
    
    const response: SocketResponse = {
      event: 'leaveConversation',
      data: { 
        conversationId: payload.conversationId,
        userId: userId
      },
      message: `Has salido de la conversación ${payload.conversationId}`,
      timestamp: new Date(),
      success: true
    };
    
    return response;
  }

  // NUEVOS MÉTODOS ESPECÍFICOS PARA EL FRONTEND
  
  

  // Enviar actualización de conversación (evento: conversationUpdate)
  sendConversationUpdate(userId: string, conversationData: any): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('conversationUpdate', {
        conversation: conversationData
      });
      return true;
    }
    return false;
  }

  // Método para enviar notificaciones a un usuario específico
  sendNotificationToUser(userId: string, notificationData: any): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      const response: SocketResponse = {
        event: 'notification',
        data: notificationData,
        message: 'Nueva notificación recibida',
        timestamp: new Date(),
        success: true
      };
      
      this.server.to(socketId).emit('notification', response);
      return true;
    }
    console.log('No se encontró el socketId para el userId en sendNotificationToUser:', userId);
    return false;
  }

  // Método para enviar mensajes a un usuario específico (mantener para compatibilidad)
  sendMessageToUser(userId: string, messageData: any, message: string): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      const response: SocketResponse = {
        event: 'message',
        data: messageData,
        message: `${message}`,
        timestamp: new Date(),
        success: true
      };
      
      this.server.to(socketId).emit('message', response);
      return true;
    }
    console.log('No se encontró el socketId para el userId sendMessageToUser:', userId);
    return false;
  }

  // Método para enviar actualizaciones de trabajos a un usuario específico
  sendJobUpdateToUser(userId: string, jobUpdateData: any): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      const response: SocketResponse = {
        event: 'jobUpdate',
        data: jobUpdateData,
        message: 'Actualización de trabajo disponible',
        timestamp: new Date(),
        success: true
      };
      
      this.server.to(socketId).emit('jobUpdate', response);
      return true;
    }
    console.log('No se encontró el socketId para el userId sendJobUpdateToUser:', userId);
    return false;
  }

  // Método para transmitir a todos los usuarios conectados
  broadcastToAll(event: string, data: any, message: string = 'Broadcast message'): void {
    const response: SocketResponse = {
      event,
      data,
      message,
      timestamp: new Date(),
      success: true
    };
    
    this.server.emit(event, response);
  }

  // Método para notificar que un usuario está escribiendo
  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { receiverId: string, isTyping: boolean }) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;
    
    const socketId = this.userSocketMap.get(payload.receiverId);
    if (socketId) {
      const response: SocketResponse = {
        event: 'userTyping',
        data: {
          userId,
          isTyping: payload.isTyping
        },
        message: `Usuario ${payload.isTyping ? 'está escribiendo' : 'dejó de escribir'}`,
        timestamp: new Date(),
        success: true
      };
      
      this.server.to(socketId).emit('userTyping', response);
    }
    console.log('No se encontró el socketId para el userId handleTyping:', payload.receiverId);
  }
  
  // Método para notificar que un mensaje ha sido entregado
  @SubscribeMessage('messageDelivered')
  handleMessageDelivered(client: Socket, payload: { messageId: string, senderId: string }) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;
    
    const socketId = this.userSocketMap.get(payload.senderId);
    if (socketId) {
      const response: SocketResponse = {
        event: 'messageDeliveryStatus',
        data: {
          messageId: payload.messageId,
          status: 'delivered',
          deliveredAt: new Date()
        },
        message: 'Mensaje entregado exitosamente',
        timestamp: new Date(),
        success: true
      };
      
      this.server.to(socketId).emit('messageDeliveryStatus', response);
    }
    console.log('No se encontró el socketId para el userId handleMessageDelivered:', userId);
  }

  // Método helper para enviar errores
  sendErrorToUser(userId: string, event: string, error: string): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      const response: SocketResponse = {
        event,
        data: { error },
        message: 'Error en la operación',
        timestamp: new Date(),
        success: false
      };
      
      this.server.to(socketId).emit('error', response);
      return true;
    }
    console.log('No se encontró el socketId para el userId sendErrorToUser:', userId);
    return false;
  }

  // NUEVOS MÉTODOS ESPECÍFICOS PARA LOS CAMBIOS

  // Enviar nuevo mensaje completo
  sendNewMessage(userId: string, messageData: any): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newMessage', {
        message: messageData
      });
      return true;
    }
    console.log('No se encontró el socketId para el userId sendNewMessage:', userId);
    return false;
  }

  // Enviar mensaje marcado como leído (solo el mensaje)
  sendMessageRead(userId: string, messageData: any): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('messageRead', {
        message: messageData
      });
      return true;
    }
    console.log('No se encontró el socketId para el userId sendMessageRead:', userId);
    return false;
  }

  // Enviar múltiples mensajes marcados como leídos
  sendMessagesRead(userId: string, messagesData: any[]): boolean {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('messagesRead', {
        messages: messagesData
      });
      return true;
    }
    console.log('No se encontró el socketId para el userId sendMessagesRead:', userId);
    return false;
  }
}