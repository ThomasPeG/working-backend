import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/employee/create-employee.dto';
import { UpdateEmployeeDto } from './dto/employee/update-employee.dto';
import { Response } from 'src/interfaces/response.interface';
import { JwtService } from '@nestjs/jwt';
import { CreateEducationDto } from './dto/education/create-education.dto';
import { CreateExperienceDto } from './dto/experience/create-experience.dto';
import { UpdateExperienceDto } from './dto/experience/update-experience.dto';
import { Experience } from 'src/interfaces/experience.interface';
import { Education } from 'src/interfaces/education.interface';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async create(userId: string, employeeData: CreateEmployeeDto): Promise<Response> {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Crear el perfil de empleado con relaciones
    const employee = await this.prisma.employee.create({
      data: {
        cv: employeeData.cv,
        interests: employeeData.interests,
        skills: employeeData.skills,
        user: {
          connect: { id: userId }
        }
      }
    });
    const payload = { userId: employee.userId, sub: employee.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: {employee},
      message: 'Perfil de empleado creado exitosamente',
    };
  }

  async findByUserId(userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId },
      include: {
        experiences: true,
        education: true,
        user: true
      }
    });

    if (!employee) {
      throw new NotFoundException(`Perfil de empleado para usuario ${userId} no encontrado`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    // Verificar que el empleado existe
    const exists = await this.prisma.employee.findUnique({
      where: { id }
    });

    if (!exists) {
      throw new NotFoundException(`Perfil de empleado con ID ${id} no encontrado`);
    }

    // Actualizar el empleado
    return this.prisma.employee.update({
      where: { id },
      data: {
        cv: updateEmployeeDto.cv,
        interests: updateEmployeeDto.interests,
        skills: updateEmployeeDto.skills
        // Nota: Para actualizar relaciones como experiences o education,
        // necesitarías usar operaciones más complejas como upsert, connect, disconnect, etc.
      },
      include: {
        experiences: true,
        education: true,
        user: true
      }
    });
  }

  async remove(id: string) {
    // Verificar que el empleado existe
    const exists = await this.prisma.employee.findUnique({
      where: { id }
    });

    if (!exists) {
      throw new NotFoundException(`Perfil de empleado con ID ${id} no encontrado`);
    }

    // Eliminar el empleado
    return this.prisma.employee.delete({
      where: { id }
    });
  }

  async addExperience(employeeId: string, experienceData: CreateExperienceDto): Promise<Response> {
    // Verificar que el empleado existe
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new NotFoundException(`Perfil de empleado con ID ${employeeId} no encontrado`);
    }

    // Crear la experiencia laboral
    const experience = await this.prisma.experience.create({
      data: {
        ...experienceData,
        employee: {
          connect: { id: employee.id }
        }
      }
    });

    return {
      access_token: this.jwtService.sign({ sub: experience.id }),
      data: { experience },
      message: 'Experiencia laboral agregada exitosamente',
    };
  }

  // async addEducation(employeeId: string, educationData: CreateEducationDto): Promise<Response> {
  //   // Verificar que el empleado existe
  //   const employee = await this.prisma.employee.findUnique({
  //     where: { id: employeeId }
  //   });

  //   if (!employee) {
  //     throw new NotFoundException(`Perfil de empleado con ID ${employeeId} no encontrado`);
  //   }

  //   // Crear el registro educativo
  //   const createEducation = await this.prisma.education.create({
  //     data: {
  //       ...educationData,
  //       employee: {
  //         connect: { id: employee.id }
  //       }
  //     }
  //   });
  //   const payload = { title: createEducation.educationType, sub: createEducation.id };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //     data: { education: createEducation },
  //     message: 'Registro educativo agregado exitosamente',
  //   };
  // }

  // También podemos agregar funciones para actualizar y eliminar experiencias y educación
  
  async updateExperience(id: string, experienceData: Partial<UpdateExperienceDto>): Promise<Response> {
    // Verificar que la experiencia existe
    const exists = await this.prisma.experience.findUnique({
      where: { id }
    });

    if (!exists) {
      throw new NotFoundException(`Experiencia con ID ${id} no encontrada`);
    }

    // Preparar los datos para actualizar
    const updateData: Partial<Experience> = {};
    if (experienceData.position) updateData.position = experienceData.position;
    if (experienceData.company) updateData.company = experienceData.company;
    if (experienceData.description !== undefined) updateData.description = experienceData.description;
    if (experienceData.startDate) updateData.startDate = new Date(experienceData.startDate);
    if (experienceData.endDate !== undefined) {
      updateData.endDate = new Date(experienceData.endDate)
    }
    if (experienceData.currentlyWorking !== undefined) updateData.currentlyWorking = experienceData.currentlyWorking;

    // Actualizar la experiencia
    const experience = await this.prisma.experience.update({
      where: { id },
      data: updateData
    });
    const payload = { company: updateData.company ?? 'Sin Empresa', sub: updateData.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: { experience },
      message: 'Experiencia laboral actualizada exitosamente',
    };
  }

  async updateEducation(id: string, educationData: Partial<CreateEducationDto>): Promise<Response> {
    // Verificar que el registro educativo existe
    const exists = await this.prisma.education.findUnique({
      where: { id }
    });

    if (!exists) {
      throw new NotFoundException(`Registro educativo con ID ${id} no encontrado`);
    }

    // Preparar los datos para actualizar
    const updateData: Partial<Education> = {};
    if (educationData.educationType) updateData.educationType = educationData.educationType;
    if (educationData.institution) updateData.institution = educationData.institution;
    if (educationData.fieldOfStudy) updateData.fieldOfStudy = educationData.fieldOfStudy;
    if (educationData.startDate) updateData.startDate = new Date(educationData.startDate);
    if (educationData.endDate !== undefined) {
      updateData.endDate = new Date(educationData.endDate)
    }
    if (educationData.currentlyStudying !== undefined) updateData.currentlyStudying = educationData.currentlyStudying;

    // Actualizar el registro educativo
    const education = await this.prisma.education.update({
      where: { id },
      data: updateData
    });
    const payload = { company: updateData.educationType ?? 'Sin Tipo', sub: updateData.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: { education },
      message: 'Registro educativo actualizado exitosamente',
    };
  }

  async removeExperience(id: string): Promise<Response> {
    // Verificar que la experiencia existe
    const exists = await this.prisma.experience.findUnique({
      where: { id }
    });

    if (!exists) {
      throw new NotFoundException(`Experiencia con ID ${id} no encontrada`);
    }

    // Eliminar la experiencia
    const experience = await this.prisma.experience.delete({
      where: { id }
    });
    const payload = { company: experience.company , sub: experience.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: { experience },
      message: 'Experiencia laboral eliminada exitosamente',
    };
  }

  async removeEducation(id: string): Promise<Response> {
    // Verificar que el registro educativo existe
    const exists = await this.prisma.education.findUnique({
      where: { id }
    });

    if (!exists) {
      throw new NotFoundException(`Registro educativo con ID ${id} no encontrado`);
    }

    // Eliminar el registro educativo
    const education = await this.prisma.education.delete({
      where: { id }
    });
    const payload = { company: education.educationType , sub: education.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: { education },
      message: 'Registro educativo actualizado exitosamente',
    };
  }
}