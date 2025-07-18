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
    console.log('IDDDDDDDDDD',userId);
    console.log('employeeData',employeeData);
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
        skills: employeeData.skills,
        jobInterests: employeeData.jobInterests,
        spokenLanguages: employeeData.spokenLanguages,
        user: {
          connect: { id: userId }
        }
      },
    });
    
    // Devolver el usuario actualizado con su perfil de empleado
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: employee.userId },
      include: {
        employeeProfile: true
      }
    });
    
    const payload = { email: updatedUser!.email, sub: updatedUser!.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: { user: updatedUser },
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
        jobInterests: updateEmployeeDto.jobInterests,
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

  async addEducation(employeeId: string, educationData: CreateEducationDto): Promise<Response> {
    console.log('employeeId',employeeId)
    // Verificar que el empleado existe
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new NotFoundException(`Perfil de empleado con ID ${employeeId} no encontrado`);
    }

    // Crear el registro educativo
    const createEducation = await this.prisma.education.create({
      data: {
        ...educationData,
        employee: {
          connect: { id: employee.id }
        }
      }
    });
    const payload = { title: createEducation.educationType, sub: createEducation.id };
    return {
      access_token: this.jwtService.sign(payload),
      data: { education: createEducation },
      message: 'Registro educativo agregado exitosamente',
    };
  }

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

  async getRecommendedEmployees(userId: string, limit: number = 10): Promise<Response> {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employeeProfile: true,
        jobs: true
      }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Condiciones base para filtrar usuarios
    const baseWhere = {
      id: { not: userId }, // Excluir al usuario actual
      // Excluir usuarios sin nombre o fecha de nacimiento (perfil incompleto)
      name: { not: null },
      birthDate: { not: null },
      isPrivate: false // Filtrar usuarios privados
    };
    console.log('Base where filter:', baseWhere);

    let recommendedUsers: any[] = [];


    // CASO 1: Usuario es empleado con perfil y tiene intereses laborales
    if (user.userType === 'employee' && user.employeeProfile && user.employeeProfile.jobInterests.length > 0) {
      // Buscar usuarios con intereses laborales similares (70% del límite)
      const similarUsersCount = Math.ceil(limit * 0.7);
      const similarUsers = await this.prisma.user.findMany({
        where: {
          ...baseWhere,
          employeeProfile: {
            jobInterests: { hasSome: user.employeeProfile.jobInterests }
          }
        },
        include: {
          employeeProfile: {
            include: {
              experiences: true,
              education: true
            }
          }
        },
        take: similarUsersCount
      });

      // Calcular cuántos usuarios diversos necesitamos
      const diverseCount = limit - similarUsers.length;

      // Buscar usuarios con diferentes intereses laborales para diversidad
      let diverseUsers:any = [];
      if (diverseCount > 0) {
        diverseUsers = await this.prisma.user.findMany({
          where: {
            ...baseWhere,
            id: { notIn: similarUsers.map(u => u.id) } // Excluir usuarios ya incluidos
          },
          include: {
            employeeProfile: {
              include: {
                experiences: true,
                education: true
              }
            }
          },
          take: diverseCount
        });
      }

    recommendedUsers  = [...similarUsers, ...diverseUsers];
    }
    // CASO 2: Usuario es empleador con trabajos registrados
    else if (user.userType === 'empleador' && user.jobs && user.jobs.length > 0) {
      // Obtener los tipos de trabajos del empleador
      const jobTitles = user.jobs.map(job => job.title);

      // Buscar empleados con intereses laborales similares a los trabajos del empleador (70% del límite)
      const similarUsersCount = Math.ceil(limit * 0.7);
      const similarUsers = await this.prisma.user.findMany({
        where: {
          ...baseWhere,
          userType: 'employee',
          employeeProfile: {
            jobInterests: { hasSome: jobTitles }
          }
        },
        include: {
          employeeProfile: {
            include: {
              experiences: true,
              education: true
            }
          }
        },
        take: similarUsersCount
      });

      // Calcular cuántos usuarios diversos necesitamos
      const diverseCount = limit - similarUsers.length;

      // Buscar usuarios diversos para completar el límite
      let diverseUsers :any[] = [];
      if (diverseCount > 0) {
        diverseUsers = await this.prisma.user.findMany({
          where: {
            ...baseWhere,
            id: { notIn: similarUsers.map(u => u.id) } // Excluir usuarios ya incluidos
          },
          include: {
            employeeProfile: {
              include: {
                experiences: true,
                education: true
              }
            }
          },
          take: diverseCount
        });
      }

     recommendedUsers = [...similarUsers, ...diverseUsers];      
    }
    // CASO 3: Usuario sin perfil de empleado o sin intereses laborales o empleador sin trabajos
    else {
      recommendedUsers = await this.prisma.user.findMany({
        where: baseWhere,
        include: {
          employeeProfile: {
            include: {
              experiences: true,
              education: true
            }
          }
        },
        take: limit
      });
    }

    // Eliminar información sensible antes de devolver
    const sanitizedUsers = recommendedUsers.map(user => ({
      id: user.id,
      name: user.name,
      profilePhoto: user.profilePhoto,
      birthplace: user.birthplace,
      gender: user.gender,
      employeeProfile: user.employeeProfile ? {
        id: user.employeeProfile?.id,
        jobInterests: user.employeeProfile?.jobInterests,
        skills: user.employeeProfile?.skills,
        spokenLanguages: user.employeeProfile?.spokenLanguages,
      } : null
    })).filter(user => user.id !== userId)

    return {
      access_token: null,
      data: { users: sanitizedUsers },
      message: 'Usuarios recomendados obtenidos exitosamente'
    };
  }
}