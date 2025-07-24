import { JobSchema } from './../schemas/job.schema';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Response } from 'src/interfaces/response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from '../schemas/job.schema';
import { JobType, JobTypeDocument } from '../schemas/job-type.schema';  // NUEVO IMPORT
import { Model, ObjectId } from 'mongoose';
import { User } from '@prisma/client';
import { IJob } from 'src/interfaces/job.interface';

export interface AffinityResult {
  user: User;
  jobId: string;
  totalScore: number;
  maxPossibleScore: number;
  affinityPercentage: number;
  breakdown: {
    jobType: number;         // NUEVO - El más importante
    availability: number;
    location: number;
    languages: number;
    interests: number;
    experience: number;
    education: number;
    skills: number;
    schedule: number;
    salary: number;
    age: number;
    rating: number;
    membership: number;
  };
  isEligible: boolean;
  reasons: string[];
}

export interface AffinityWeights {
  jobType: number;         // NUEVO - 25 - Crítico (el más importante)
  availability: number;     // 16 - Crítico
  location: number;        // 13 - Muy importante
  languages: number;       // 11 - Muy importante
  interests: number;       // 9 - Importante
  experience: number;      // 11 - Muy importante
  education: number;       // 7 - Moderado
  skills: number;          // 9 - Importante
  schedule: number;        // 8 - Importante
  salary: number;          // 5 - Moderado
  age: number;            // 3 - Bajo
  rating: number;         // 6 - Moderado
  membership: number;     // 2 - Bajo
}

@Injectable()
export class AffinityService {
  constructor(private prisma: PrismaService,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobType.name) private jobTypeModel: Model<JobTypeDocument>
  ) {}

  private readonly defaultWeights: AffinityWeights = {
    jobType: 25,        // NUEVO - El peso más alto
    availability: 16,
    location: 13,
    languages: 11,
    interests: 9,
    experience: 11,
    education: 7,
    skills: 9,
    schedule: 8,
    salary: 5,
    age: 3,
    rating: 6,
    membership: 2
  };

  /**
   * Calcula la afinidad entre un usuario y una oferta de trabajo
   */
  async calculateAffinity(
    userId: string, 
    jobId: string, 
    customWeights?: Partial<AffinityWeights>
  ): Promise<AffinityResult> {
    const weights = { ...this.defaultWeights, ...customWeights };
    
    // Obtener datos del usuario con todas las relaciones
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
      throw new Error('Usuario no encontrado');
    }

    const job = await this.jobModel.findById(jobId).exec();
    
    if (!job) {
      throw new Error('trabajo no encontrado');
    }
    const jobData: Partial<IJob>  = {
      _id: job._id?.toString() ?? '',
      userId: job.userId,
      title: job.title,
      description: job.description,
      place: job.place,
      jobType: job.jobType?.toString() ?? null,
      jobTypeNew: job.jobTypeNew,
      salary: job.salary,
      salaryCycle: job.salaryCycle,
      schedule: job.schedule,
      timeCommitment: job.timeCommitment,
      requiredLanguages: job.requiredLanguages,
      requiredExperience: job.requiredExperience,
      requiredEducation: job.requiredEducation,
      requiredAge: job.requiredAge,
      contractType: job.contractType,
      images: job.images,
    }

    const breakdown = {
      jobType: await this.calculateJobTypeScore(user, jobData, weights.jobType),  // AHORA ES ASYNC
      availability: this.calculateAvailabilityScore(user, jobData, weights.availability),
      location: this.calculateLocationScore(user, jobData, weights.location),
      languages: this.calculateLanguageScore(user, jobData, weights.languages),
      interests: this.calculateInterestScore(user, jobData, weights.interests),
      experience: this.calculateExperienceScore(user, jobData, weights.experience),
      education: this.calculateEducationScore(user, jobData, weights.education),
      skills: this.calculateSkillsScore(user, jobData, weights.skills),
      schedule: this.calculateScheduleScore(user, jobData, weights.schedule),
      salary: this.calculateSalaryScore(user, jobData, weights.salary),
      age: this.calculateAgeScore(user, jobData, weights.age),
      rating: this.calculateRatingScore(user, jobData, weights.rating),
      membership: this.calculateMembershipScore(user, jobData, weights.membership)
    };

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const affinityPercentage = Math.round((totalScore / maxPossibleScore) * 100);

    const { isEligible, reasons } = this.checkEligibility(user, jobData, breakdown);

    return {
      user,
      jobId,
      totalScore,
      maxPossibleScore,
      affinityPercentage,
      breakdown,
      isEligible,
      reasons
    };
  }

  /**
   * Encuentra los mejores candidatos para una oferta de trabajo
   */
  async findBestCandidates(
    userId: string,
    jobId: string, 
    limit: number = 20,
    minAffinityPercentage: number = 30
  ): Promise<Response> {
  
    // Obtener usuarios disponibles y activos
    const availableUsers = await this.prisma.user.findMany({
      where: {
        available: true,
        isActive: true,
        id: { not: userId },
        // userType: { in: ['employee', 'both'] }
      },
      select: { id: true, }
    });

    let affinityResults: AffinityResult[] = [];

    for (const user of availableUsers) {
      console.log( 'user', user);
    
      try {
        const affinity = await this.calculateAffinity(user.id, jobId);
        console.log( 'affinity', affinity);
          
        if (affinity.isEligible && affinity.affinityPercentage >= minAffinityPercentage) {
          affinityResults.push(affinity);
          console.log( 'affinityResults', affinityResults);
        }
      } catch (error) {
        console.error(`Error calculando afinidad para usuario ${user.id}:`, error);
        // Continuar con el siguiente usuario si hay error
        continue;
      }
    }

    // Ordenar por puntuación de afinidad descendente
    affinityResults = affinityResults
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
      
    return {
      access_token: null,
      data: {candidates: affinityResults},
      message: `Candidatos encontrados para la oferta`,
    }
  }

  /**
   * Encuentra las mejores ofertas para un usuario
   */
  async findBestJobsForUser(
    userId: string,
    limit: number = 20,
    minAffinityPercentage: number = 30
  ): Promise<AffinityResult[]> {
    // Obtener trabajos activos

    const activeJobs = await this.jobModel.find({ isActive: true }).exec();

    const affinityResults: AffinityResult[] = [];

    for (const job of activeJobs) {
      try {
        const affinity = await this.calculateAffinity(userId, job.id);
        
        if (affinity.isEligible && affinity.affinityPercentage >= minAffinityPercentage) {
          affinityResults.push(affinity);
        }
      } catch (error) {
        console.error(`Error calculando afinidad para trabajo ${job.id}:`, error);
      }
    }

    return affinityResults
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  // Métodos privados para calcular puntuaciones específicas

  private calculateAvailabilityScore(user: any, job: Partial<IJob> , weight: number): number {
    if (!user.available || !user.isActive) return 0;
    return weight; // Puntuación completa si está disponible
  }

  private calculateLocationScore(user: any, job: any, weight: number): number {
    // Priorizar ubicaciones estructuradas con populate
    if (user.residenceCityId && job.locationCityId) {
      // Misma ciudad = 100%
      if (user.residenceCityId.toString() === job.locationCityId.toString()) {
        return weight;
      }
      
      // Si tenemos datos poblados de las ciudades
      if (user.residenceCity && job.locationCity) {
        // Mismo país = 70%
        if (user.residenceCity.countryId.toString() === job.locationCity.countryId.toString()) {
          return weight * 0.7;
        }
        
        // Mismo continente = 30%
        if (user.residenceCity.country?.continent === job.locationCity.country?.continent) {
          return weight * 0.3;
        }
      }
      
      return weight * 0.1;
    }
    
    // Fallback a comparación legacy
    if (!user.residenceLocation || !job.place) return weight * 0.5;
    
    const userLocation = user.residenceLocation;
    const jobPlace = job.place;
    
    if (typeof jobPlace === 'string') {
      if (userLocation.city && jobPlace.toLowerCase().includes(userLocation.city.toLowerCase())) {
        return weight;
      }
      if (userLocation.country && jobPlace.toLowerCase().includes(userLocation.country.toLowerCase())) {
        return weight * 0.7;
      }
    }
    
    return weight * 0.2;
  }

  private calculateLanguageScore(user: any, job: Partial<IJob> , weight: number): number {
    // User: employeeProfile.spokenLanguages (string[]) - Prisma
    // Job: requiredLanguages (string[]) - MongoDB Schema
    if (!job.requiredLanguages || job.requiredLanguages.length === 0) return weight;
    if (!user.employeeProfile?.spokenLanguages) return 0;
    
    const userLanguages = user.employeeProfile.spokenLanguages;
    const requiredLanguages = job.requiredLanguages;
    
    const matchedLanguages = requiredLanguages.filter(lang => 
      userLanguages.some(userLang => userLang.toLowerCase() === lang.toLowerCase())
    );
    
    const matchPercentage = matchedLanguages.length / requiredLanguages.length;
    return Math.round(weight * matchPercentage);
  }

  private calculateInterestScore(user: any, job: Partial<IJob> , weight: number): number {
    if (!user.interests || user.interests.length === 0) return 0;
    if (!user.employeeProfile?.jobInterests) return 0;
    
    const userInterests = [...user.interests, ...user.employeeProfile.jobInterests];
    const jobKeywords = this.extractJobKeywords(job);
    
    const matches = userInterests.filter(interest => 
      jobKeywords.some(keyword => 
        keyword.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    const matchPercentage = Math.min(matches.length / Math.max(userInterests.length * 0.3, 1), 1);
    return Math.round(weight * matchPercentage);
  }

  private calculateExperienceScore(user: any, job: Partial<IJob> , weight: number): number {
    // User: employeeProfile.experiences - Prisma
    // Job: requiredExperience (boolean) - MongoDB Schema
    if (!job.requiredExperience) return weight; // Si no requiere experiencia
    if (!user.employeeProfile?.experiences) return 0;
    console.log('user.employeeProfile.experiences', user.employeeProfile.experiences);
    const userExperience = this.calculateTotalExperience(user.employeeProfile.experiences);
    console.log( 'userExperience', userExperience);
    // Como requiredExperience es boolean en MongoDB, si es true y el usuario tiene experiencia
    if (job.requiredExperience === true && userExperience > 0) {
      return weight;
    } else if (job.requiredExperience === true && userExperience === 0) {
      return 0;
    }
    
    return weight; // Si no requiere experiencia
  }

  private calculateEducationScore(user: any, job: Partial<IJob> , weight: number): number {
    // User: employeeProfile.education - Prisma
    // Job: requiredEducation (boolean) - MongoDB Schema
    if (!job.requiredEducation) return weight; // Si no requiere educación
    if (!user.employeeProfile?.education) return 0;
    
    // Como requiredEducation es boolean en MongoDB
    if (job.requiredEducation === true && user.employeeProfile.education.length > 0) {
      return weight;
    } else if (job.requiredEducation === true && user.employeeProfile.education.length === 0) {
      return 0;
    }
    
    return weight; // Si no requiere educación
  }

  private calculateSkillsScore(user: any, job: Partial<IJob>, weight: number): number {
    if (!user.employeeProfile?.skills) return 0;
    
    const userSkills = this.normalizeSkills(user.employeeProfile.skills);
    const jobKeywords = this.extractJobKeywords(job).map(k => this.normalizeText(k));
    
    const matchedSkills = jobKeywords.filter(keyword => 
      this.findBestMatch(keyword, userSkills)
    );
    
    const matchPercentage = Math.min(matchedSkills.length / Math.max(jobKeywords.length * 0.3, 1), 1);
    return Math.round(weight * matchPercentage);
  }

  // Método para normalizar skills del usuario
  private normalizeSkills(skills: string): string[] {
    return skills.toLowerCase()
      .split(/[,;\n]+/) // Separar por comas, punto y coma o saltos de línea
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => this.normalizeText(skill));
  }

  // Método para normalizar texto (remover caracteres especiales)
  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remover caracteres especiales, espacios, guiones, puntos
      .trim();
  }

  // Búsqueda mejorada con normalización y fuzzy matching
  private findBestMatch(keyword: string, userSkills: string[]): boolean {
    const normalizedKeyword = keyword;
    
    return userSkills.some(skill => {
      const normalizedSkill = skill;
      
      // 1. Coincidencia exacta después de normalización
      if (normalizedSkill === normalizedKeyword) {
        return true;
      }
      
      // 2. Coincidencia por contención (uno contiene al otro)
      if (normalizedSkill.includes(normalizedKeyword) || 
          normalizedKeyword.includes(normalizedSkill)) {
        return true;
      }
      
      // 3. Búsqueda fuzzy para errores tipográficos
      if (normalizedKeyword.length >= 4 && normalizedSkill.length >= 4) {
        const distance = this.levenshteinDistance(normalizedKeyword, normalizedSkill);
        const maxLength = Math.max(normalizedKeyword.length, normalizedSkill.length);
        const similarity = 1 - (distance / maxLength);
        
        return similarity >= 0.8; // 80% de similitud mínima
      }
      
      return false;
    });
  }

  // Algoritmo de distancia de Levenshtein para detectar errores tipográficos
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    // Inicializar primera fila y columna
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    // Llenar la matriz
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]; // Sin costo si son iguales
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Sustitución
            matrix[i][j - 1] + 1,     // Inserción
            matrix[i - 1][j] + 1      // Eliminación
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculateScheduleScore(user: any, job: Partial<IJob> , weight: number): number {
    // Job: schedule (string) - MongoDB Schema
    if (!job.schedule) return weight; // Si no especifica horario
    
    // Lógica simplificada - en producción sería más compleja
    const flexibleSchedules = ['flexible', 'remoto', 'medio tiempo', 'part-time'];
    const isFlexible = flexibleSchedules.some(schedule => 
      job.schedule?.toLowerCase().includes(schedule)
    );
    
    return isFlexible ? weight : weight * 0.7;
  }

  private calculateSalaryScore(user: any, job: Partial<IJob> , weight: number): number {
    if (!job.salary) return weight; // Si no especifica salario
    
    // Lógica simplificada - idealmente compararía con expectativas del usuario
    // Por ahora, asumimos que cualquier salario es aceptable
    return weight;
  }

  private calculateAgeScore(user: any, job: Partial<IJob> , weight: number): number {
    // User: birthDate (DateTime) - Prisma
    // Job: requiredAge (number) - MongoDB Schema
    if (!job.requiredAge || !user.birthDate) return weight;
    
    const userAge = this.calculateAge(user.birthDate);
    const requiredAge = job.requiredAge;
    
    if (userAge >= requiredAge) {
      return weight;
    } else if (userAge >= requiredAge - 2) {
      return weight * 0.7;
    }
    
    return 0;
  }

  private calculateRatingScore(user: any, job: Partial<IJob> , weight: number): number {
    if (!user.rating || user.totalRatings === 0) return weight * 0.5;
    
    const ratingPercentage = user.rating / 5.0; // Normalizar a porcentaje
    return Math.round(weight * ratingPercentage);
  }

  private calculateMembershipScore(user: any, job: Partial<IJob> , weight: number): number {
    const membershipBonus = {
      'FREE': 0,
      'PREMIUM': 0.5,
      'VIP': 1
    };
    
    const bonus = membershipBonus[user.userMembershipPlan] || 0;
    return Math.round(weight * bonus);
  }

  private checkEligibility(user: any, job: Partial<IJob> , breakdown: any): { isEligible: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let isEligible = true;
    
    // Verificaciones críticas
    if (!user.available) {
      isEligible = false;
      reasons.push('Usuario no disponible');
    }
    
    if (!user.isActive) {
      isEligible = false;
      reasons.push('Usuario inactivo');
    }
    
    // Verificar que el usuario tenga perfil de empleado
    if (!user.employeeProfile) {
      isEligible = false;
      reasons.push('Usuario sin perfil de empleado');
    }
    
    // Verificar que tenga al menos algunos datos básicos
    const hasBasicData = (
      (user.interests && user.interests.length > 0) ||
      (user.employeeProfile?.jobInterests && user.employeeProfile.jobInterests.length > 0) ||
      (user.employeeProfile?.skills) ||
      (user.employeeProfile?.spokenLanguages && user.employeeProfile.spokenLanguages.length > 0)
    );
    
    if (!hasBasicData) {
      isEligible = false;
      reasons.push('Usuario sin datos de perfil suficientes');
    }
    
    if (breakdown.availability === 0) {
      isEligible = false;
      reasons.push('No cumple criterios de disponibilidad');
    }
    
    // Verificaciones de requisitos mínimos
    if (job.requiredAge && user.birthDate) {
      const userAge = this.calculateAge(user.birthDate);
      if (userAge < job.requiredAge) {
        isEligible = false;
        reasons.push(`Edad insuficiente (${userAge} < ${job.requiredAge})`);
      }
    }
    
    if (job.requiredLanguages && job.requiredLanguages.length > 0 && breakdown.languages === 0) {
      isEligible = false;
      reasons.push('No cumple requisitos de idioma');
    }
    
    return { isEligible, reasons };
  }

  // Métodos auxiliares
  
  private extractJobKeywords(job: any): string[] {
    const keywords: string[] = [];
    
    if (job.title) keywords.push(...job.title.split(' '));
    if (job.description) keywords.push(...job.description.split(' ').slice(0, 20)); // Primeras 20 palabras
    if (job.contractType) keywords.push(job.contractType);
    
    return keywords.filter(keyword => keyword.length > 3); // Filtrar palabras muy cortas
  }
  
  private calculateTotalExperience(experiences: any[]): number {
    return experiences.reduce((total, exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.currentlyWorking ? new Date() : new Date(exp.endDate);
      const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return total + Math.max(years, 0);
    }, 0);
  }
  
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * NUEVO MÉTODO MEJORADO - Calcula la puntuación basada en la coincidencia entre jobType y jobInterests
   * Maneja tanto jobType (ID) como jobTypeNew (nombre personalizado)
   */
  private async calculateJobTypeScore(user: any, job: Partial<IJob>, weight: number): Promise<number> {
    // Validaciones iniciales
    if (!user.employeeProfile?.jobInterests || user.employeeProfile.jobInterests.length === 0) {
      return 0;
    }

    const jobInterests = user.employeeProfile.jobInterests.map((interest: string) => 
      interest.toLowerCase().trim()
    );

    let jobTypeData: any = null;
    let jobTypeName = '';

    // CASO 1: job.jobType existe (es un ID de JobType en MongoDB)
    if (job.jobType) {
      try {
        jobTypeData = await this.jobTypeModel.findById(job.jobType).exec();
        if (jobTypeData) {
          jobTypeName = jobTypeData.name.toLowerCase().trim();
        }
      } catch (error) {
        console.error('Error fetching JobType:', error);
      }
    }
    
    // CASO 2: job.jobTypeNew existe (nombre personalizado)
    if (!jobTypeData && job.jobTypeNew) {
      jobTypeName = job.jobTypeNew.toLowerCase().trim();
    }

    // Si no hay información de tipo de trabajo, retornar 0
    if (!jobTypeName) {
      return 0;
    }

    // COINCIDENCIA EXACTA con nombre del tipo de trabajo
    if (jobInterests.includes(jobTypeName)) {
      return weight; // 100% del peso (25 puntos)
    }

    // Si tenemos datos completos del JobType, buscar coincidencias en category y description
    if (jobTypeData) {
      const category = jobTypeData.category?.toLowerCase().trim() || '';
      const description = jobTypeData.description?.toLowerCase().trim() || '';
      
      // COINCIDENCIA EXACTA con categoría
      if (category && jobInterests.includes(category)) {
        return Math.round(weight * 0.8); // 80% del peso (20 puntos)
      }

      // COINCIDENCIA en descripción (palabras clave)
      if (description) {
        const descriptionWords = description.split(/\s+/).filter(word => word.length > 3);
        let descriptionMatches = 0;
        
        for (const interest of jobInterests) {
          const interestWords = interest.split(/\s+/);
          const commonWords = descriptionWords.filter(word => 
            interestWords.some(interestWord => 
              interestWord.includes(word) || word.includes(interestWord)
            )
          );
          
          if (commonWords.length > 0) {
            descriptionMatches += commonWords.length / descriptionWords.length;
          }
        }
        
        if (descriptionMatches > 0) {
          const descriptionScore = Math.min(descriptionMatches / jobInterests.length, 0.6);
          return Math.round(weight * descriptionScore); // Hasta 60% del peso (15 puntos)
        }
      }

      // Verificar sinónimos si existen
      if (jobTypeData.synonyms && jobTypeData.synonyms.length > 0) {
        const synonyms = jobTypeData.synonyms.map(syn => syn.toLowerCase().trim());
        for (const synonym of synonyms) {
          if (jobInterests.includes(synonym)) {
            return Math.round(weight * 0.9); // 90% del peso (22.5 puntos)
          }
        }
      }
    }

    // COINCIDENCIA PARCIAL con palabras clave (para ambos casos)
    const jobTypeWords = jobTypeName.split(/\s+/);
    let partialMatches = 0;
    
    for (const interest of jobInterests) {
      const interestWords = interest.split(/\s+/);
      
      // Verificar si hay palabras en común
      const commonWords = jobTypeWords.filter(word => 
        word.length > 2 && interestWords.some(interestWord => 
          interestWord.includes(word) || word.includes(interestWord)
        )
      );
      
      if (commonWords.length > 0) {
        partialMatches += commonWords.length / jobTypeWords.length;
      }
    }

    // Calcular puntuación basada en coincidencias parciales
    if (partialMatches > 0) {
      const partialScore = Math.min(partialMatches / jobInterests.length, 0.5);
      return Math.round(weight * partialScore); // Hasta 50% del peso (12.5 puntos)
    }

    return 0;
  }
}