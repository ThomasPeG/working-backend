import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Job } from 'src/interfaces/job.interface';
import { Response } from 'src/interfaces/response.interface';
import { CreateJobDto } from './dto/job/create-job.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(employerId: string, jobData: CreateJobDto): Promise<Response> {
    // Verificar que el usuario existe y es un empleador
    const employer = await this.prisma.user.findUnique({
      where: { id: employerId }
    });
    
    if (!employer) {
      throw new NotFoundException(`Usuario con ID ${employerId} no encontrado`);
    }
    if (employer.userType !== 'empleador') {
      throw new ForbiddenException('Solo los empleadores pueden crear trabajos');
    }
  
    // Crear el trabajo usando Prisma con la relación employer
    const createdJob = await this.prisma.job.create({
      data: {
        ...jobData,
        employer: {
          connect: { id: employerId }
        }
      }
    });
    const payload = { title: createdJob.title, sub: createdJob.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {job: createdJob},
      message: 'Trabajo creado exitosamente',
    };
  }

  async findAll(filters?: Partial<Job>): Promise<Response> {
    // Construir el objeto de condiciones para Prisma
    const where: any = { isActive: true };
    
    if (filters) {
      if (filters.title) {
        where.title = { contains: filters.title, mode: 'insensitive' };
      }
      
      if (filters.requiredExperience) {
        where.requiredExperience = filters.requiredExperience;
      }
      
    }

    const jobs = await this.prisma.job.findMany({
      where,
      include: {
        employer: true
      }
    });
    return {
      access_token: null,
      data: {jobs},
      message: `Se encontraron ${jobs.length} trabajos`,
    };
  }

  async findOne(id: string): Promise<Response> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        employer: true
      }
    });

    if (!job) {
      throw new NotFoundException(`Trabajo con ID ${id} no encontrado`);
    }

    const payload = { title: job.title, sub: job.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {job: job},
      message: `Trabajo ${job.title || ''} encontrado exitosamente por ID`,
    };
  }

  async findByEmployerId(employerId: string): Promise<Response> {
    const jobs = await this.prisma.job.findMany({
      where: { 
        employerId 
      },
      include: {
        employer: true
      }
    });
    return {
      access_token: null,
      data: {jobs},
      message: `${jobs.length} trabajos encontrados exitosamente por ID de empleador`,
    };
  }

  async update(id: string, employerId: string, jobData: Partial<Job>): Promise<Response> {
    // Primero verificamos que el trabajo existe y pertenece al empleador
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { employer: true }
    });

    if (!job) {
      throw new NotFoundException(`Trabajo con ID ${id} no encontrado`);
    }

    // Verificar que el usuario que actualiza es el propietario del trabajo
    if (job.employerId !== employerId) {
      throw new ForbiddenException('No tienes permiso para actualizar este trabajo');
    }

    // Eliminar campos que no queremos actualizar
    const { id: jobId, employerId: empId, createdAt, updatedAt, ...updateData } = jobData as any;

    // Actualizar el trabajo
    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        employer: true
      }
    });
    const payload = { title: updatedJob.title, sub: updatedJob.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {job: updatedJob},
      message: `Trabajo ${updatedJob.title || ''} actualizado exitosamente por ID`,
    };
  }

  async remove(id: string, employerId: string): Promise<Response> {
    // Primero verificamos que el trabajo existe y pertenece al empleador
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { employer: true }
    });

    if (!job) {
      throw new NotFoundException(`Trabajo con ID ${id} no encontrado`);
    }

    // Verificar que el usuario que elimina es el propietario del trabajo
    if (job.employerId !== employerId) {
      throw new ForbiddenException('No tienes permiso para eliminar este trabajo');
    }

    const deletedJob = await this.prisma.job.delete({
      where: { id }
    });

    const payload = { title: deletedJob.title, sub: deletedJob.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {job: deletedJob},
      message: `Trabajo ${deletedJob.title || ''} eliminado exitosamente por ID`,
    };
  }
}