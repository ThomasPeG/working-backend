import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/user/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'src/interfaces/user.interface';
import { Response } from 'src/interfaces/response.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  // Función para crear tokens JWT
  async createToken({userId}): Promise<Response> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      throw new NotFoundException(`No se podra refrescar el token debido a que no se encontro el usuario con id: ${userId}`);
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {user},
      message: ``,
    }
  }

  async validateUser(email: string, password: string): Promise<any> {

    const user = await this.prisma.user.findUnique({ where: {email}})
    
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User): Promise<Response> {
    const payload = { email: user.email, sub: user.id };
    
    // Obtener el perfil de empleado si existe
    const userWithProfile = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        employeeProfile: {
          include: {
            experiences: true,
            education: true
          }
        }
      }
    });
    
    const response = {
      access_token: this.jwtService.sign(payload),
      data: {user: userWithProfile},
      message: `Usuario ${user.name || ''} logueado exitosamente`,
    }
    console.log("RESPONSE:", response);
    return response;
  }

  async googleLogin(user: any): Promise<Response> {
    if (!user) {
      throw new UnauthorizedException('No user from Google');
    }

    let userInDb = await this.prisma.user.findUnique({
      where: { email: user.email },
      include: {
        employeeProfile: {
          include: {
            experiences: true,
            education: true
          }
        }
      }
    });

    // Si no existe, crear un nuevo usuario
    if (!userInDb) {
      userInDb = await this.prisma.user.create({
        data: {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          profilePhoto: user.picture,
        },
        include: {
          employeeProfile: {
            include: {
              experiences: true,
              education: true
            }
          }
        }
      });
    }

    const payload = { email: userInDb.email, sub: userInDb.id };
    const response = {
      access_token: this.jwtService.sign(payload),
      data: { user: userInDb },
      message: `Usuario ${userInDb.name || ''} logueado exitosamente con Google`,
    };
    return response;
  }

  async register(user: CreateUserDto): Promise<Response> {
    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email }
    });
    
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }else if (!user.password) {
      throw new UnauthorizedException('Password is required');
    }
    
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userData = {
      email : user.email,
      password : hashedPassword
    }
    
    // Crear el usuario con la contraseña encriptada usando una transacción
    const newUser = await this.prisma.user.create({ data: userData })

    const payload = { email: newUser.email, sub: newUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {user: newUser},
      message: `Usuario ${newUser.name || ''} creado exitosamente`,
    }
  }
}