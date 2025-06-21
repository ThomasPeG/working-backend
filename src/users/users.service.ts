import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/user/create-user.dto';
import { UpdateUserDto } from './dto/user/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'src/interfaces/response.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(user: CreateUserDto): Promise<Response> {
    const createdUser = await this.prisma.user.create({
      data: user,
    });
    const payload = { email: createdUser.email, sub: createdUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {user: createdUser},
      message: `Usuario ${user.name || ''} creado exitosamente`,
    };
  }

  async findAll(): Promise<Response> {
    const users = await this.prisma.user.findMany();
    return {
      access_token: null,
      data: {users},
      message: `Se encontraron ${users.length} usuarios`,
    };
  }

  async findOne(id: string): Promise<Response> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        employeeProfile: {
          include: {
            experiences: true,
            education: true
          }
        }
      }
    });
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {user},
      message: `Usuario ${user.name || ''} encontrado exitosamente por ID`,
    };
  }

  async findByEmail(email: string): Promise<Response> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        employeeProfile: {
          include: {
            experiences: true,
            education: true
          }
        }
      }
    });
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {user},
      message: `Usuario ${user.name || ''} encontrado exitosamente por email`,
    };
  }

  async update(id: string, user: UpdateUserDto): Promise<Response> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: user,
      include: {
        employeeProfile: {
          include: {
            experiences: true,
            education: true
          }
        }
      }
    });
    const payload = { email: updatedUser.email, sub: updatedUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {user: updatedUser},
      message: 'Usuario actualizado exitosamente',
    };
  }

  async remove(id: string): Promise<Response> {
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });
    const payload = { email: deletedUser.email, sub: deletedUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {user: deletedUser},
      message: 'Usuario eliminado exitosamente',
    };
  }
}