import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFriendshipDto } from './dto/friendship/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/friendship/update-friendship.dto';
import { Response } from '../interfaces/response.interface';
import { NotificationType } from 'src/notifications/types/notification.types';
import { FriendRequestNotificationsService } from 'src/notifications/services/friend-request-notifications.service';

@Injectable()
export class FriendshipService {
  constructor(private prisma: PrismaService,
    private friendRequestNotificationsService: FriendRequestNotificationsService
  ) {}

  // Enviar solicitud de amistad
  async sendFriendRequest(userId: string, createFriendshipDto: CreateFriendshipDto): Promise<Response> {
    // Verificar que no se envíe solicitud a sí mismo
    if (userId === createFriendshipDto.addresseeId) {
      throw new ConflictException('No puedes enviarte una solicitud de amistad a ti mismo');
    }

    // Verificar que el destinatario exista
    const addressee = await this.prisma.user.findUnique({
      where: { id: createFriendshipDto.addresseeId }
    });

    if (!addressee) {
      throw new NotFoundException('Usuario destinatario no encontrado');
    }

    // Verificar si ya existe una solicitud entre estos usuarios
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: createFriendshipDto.addresseeId },
          { requesterId: createFriendshipDto.addresseeId, addresseeId: userId }
        ]
      }
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profilePhoto: true
      }
    });

    if (existingFriendship) {
      throw new ConflictException('Ya existe una solicitud de amistad entre estos usuarios');
    }

    // Crear la solicitud de amistad
    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId: userId,
        addresseeId: createFriendshipDto.addresseeId,
        status: createFriendshipDto.status || 'pending'
      },
      include: {
        requester: true,
        addressee: true
      }
    });
    if (!friendship?.requester?.name) {
      throw new NotFoundException('No se pudo obtener el nombre del solicitante');
    }

    this.friendRequestNotificationsService.sendFriendRequestNotification(
      {
        userId: createFriendshipDto.addresseeId,
        requesterName: friendship.requester.name,
        requesterId: friendship.requester.id,
        requestId: friendship.id,
        requesterProfilePhoto: user?.profilePhoto || ''
      }     
    );

    return {
      access_token: null,
      data: { friendship },
      message: 'Solicitud de amistad enviada exitosamente'
    };
  }

  // Responder a una solicitud de amistad (aceptar o rechazar)
  async respondToFriendRequest(userId: string, friendshipId: string, updateFriendshipDto: UpdateFriendshipDto): Promise<Response> {
    // Buscar la solicitud de amistad
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: true,
        addressee: true
      }
    });

    if (!friendship) {
      throw new NotFoundException('Solicitud de amistad no encontrada');
    }

    // Verificar que el usuario sea el destinatario de la solicitud
    if (friendship.addresseeId !== userId) {
      throw new ForbiddenException('No tienes permiso para responder a esta solicitud');
    }

    // Verificar que la solicitud esté pendiente
    if (friendship.status !== 'pending') {
      throw new ConflictException('Esta solicitud ya ha sido respondida');
    }

    let result : any;
    let message :any;

    if (updateFriendshipDto.status === 'rejected') {
      // Si la solicitud es rechazada, eliminar el registro
      await this.prisma.friendship.delete({
        where: { id: friendshipId }
      });

      result = { friendship: { ...friendship, status: 'rejected' } };
      message = 'Solicitud de amistad rechazada exitosamente';

    } else {
      // Si la solicitud es aceptada, actualizar el estado
      const updatedFriendship = await this.prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: updateFriendshipDto.status },
        include: {
          requester: true,
          addressee: true
        }
      });

      result = { friendship: updatedFriendship };
      message = 'Solicitud de amistad aceptada exitosamente'; 
    }
//VERIFICAR SI LA NOTIFICACION ESTA BIEN IMPLEMENTADA AQUI
    if (!friendship.requester.name) {
        throw new NotFoundException('No se pudo obtener el nombre del solicitante');
      }
      // Enviar notificación al solicitante de que su solicitud fue aceptada
      this.friendRequestNotificationsService.sendFriendRequestStatusNotification(
        friendship.requesterId,
        friendship.requester.name,
        friendship.requester.id,
        friendship.id,
        updateFriendshipDto.status!
      );

    return {
      access_token: null,
      data: result,
      message
    };
  }

  // Obtener todas las amistades de un usuario
  async getFriendships(userId: string): Promise<Response> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId }
        ],
        status: 'accepted'
      },
      include: {
        requester: true,
        addressee: true
      }
    });

    // Transformar los resultados para obtener solo los amigos
    const friends = friendships.map(friendship => {
      const friend = friendship.requesterId === userId ? friendship.addressee : friendship.requester;
      return {
        friendshipId: friendship.id,
        friend: {
          id: friend.id,
          name: friend.name,
          email: friend.email,
          profilePhoto: friend.profilePhoto
        },
        createdAt: friendship.createdAt
      };
    });
    console.log(friends);

    return {
      access_token: null,
      data: { friends },
      message: 'Amigos obtenidos exitosamente'
    };
  }

  // Obtener solicitudes de amistad pendientes recibidas
  async getPendingFriendRequestsReceived(userId: string): Promise<Response> {
    const pendingRequests = await this.prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'pending'
      },
      include: {
        requester: true,
        addressee: true
      }
    });

    return {
      access_token: null,
      data: { pendingRequests },
      message: 'Solicitudes pendientes recibidas, obtenidas exitosamente'
    };
  }

  // Obtener solicitudes de amistad pendientes enviadas
  async getPendingFriendRequestsSent(userId: string): Promise<Response> {
    const pendingRequests = await this.prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'pending'
      },
      include: {
        requester: true,
        addressee: true
      }
    });

    return {
      access_token: null,
      data: { pendingRequests },
      message: 'Solicitudes pendientes enviadas obtenidas exitosamente'
    };
  }

  // Eliminar una amistad
  async deleteFriendship(userId: string, friendshipId: string): Promise<Response> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) {
      throw new NotFoundException('Amistad no encontrada');
    }

    // Verificar que el usuario sea parte de la amistad
    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta amistad');
    }

    await this.prisma.friendship.delete({
      where: { id: friendshipId }
    });

    return {
      access_token: null,
      data: {},
      message: 'Amistad eliminada exitosamente'
    };
  }

  // Verificar el estado de amistad entre dos usuarios
  async checkFriendshipStatus(requesterId: string, addresseeId: string): Promise<Response> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId }
        ]
      }
    });

    let requestType: string = "";
    
    if (friendship) {
      // Determinar si el usuario principal es el que envió o recibió la solicitud
      requestType = friendship.requesterId === requesterId ? 'sent' : 'received';
    }

    return {
      access_token: null,
      data: { 
        status: friendship ? friendship.status : null, 
        requestType, // 'sent' si el usuario principal envió la solicitud, 'received' si la recibió
        friendship 
      },
      message: 'Estado de amistad verificado'
    };
  }
}