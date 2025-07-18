import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AffinityResult {
  userId: string;
  jobId: string;
  totalScore: number;
  maxPossibleScore: number;
  affinityPercentage: number;
  breakdown: {
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
  availability: number;     // 15 - Crítico
  location: number;        // 12 - Muy importante
  languages: number;       // 10 - Muy importante
  interests: number;       // 8 - Importante
  experience: number;      // 10 - Muy importante
  education: number;       // 6 - Moderado
  skills: number;          // 8 - Importante
  schedule: number;        // 7 - Importante
  salary: number;          // 5 - Moderado
  age: number;            // 3 - Bajo
  rating: number;         // 6 - Moderado
  membership: number;     // 2 - Bajo
}

@Injectable()
export class AffinityService {
  constructor(private prisma: PrismaService) {}

  private readonly defaultWeights: AffinityWeights = {
    availability: 15,
    location: 12,
    languages: 10,
    interests: 8,
    experience: 10,
    education: 6,
    skills: 8,
    schedule: 7,
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

    // Obtener datos de la oferta
    const job = await this.prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!user || !job) {
      throw new Error('Usuario o trabajo no encontrado');
    }

    const breakdown = {
      availability: this.calculateAvailabilityScore(user, job, weights.availability),
      location: this.calculateLocationScore(user, job, weights.location),
      languages: this.calculateLanguageScore(user, job, weights.languages),
      interests: this.calculateInterestScore(user, job, weights.interests),
      experience: this.calculateExperienceScore(user, job, weights.experience),
      education: this.calculateEducationScore(user, job, weights.education),
      skills: this.calculateSkillsScore(user, job, weights.skills),
      schedule: this.calculateScheduleScore(user, job, weights.schedule),
      salary: this.calculateSalaryScore(user, job, weights.salary),
      age: this.calculateAgeScore(user, job, weights.age),
      rating: this.calculateRatingScore(user, job, weights.rating),
      membership: this.calculateMembershipScore(user, job, weights.membership)
    };

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const affinityPercentage = Math.round((totalScore / maxPossibleScore) * 100);

    const { isEligible, reasons } = this.checkEligibility(user, job, breakdown);

    return {
      userId,
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
    jobId: string, 
    limit: number = 20,
    minAffinityPercentage: number = 30
  ): Promise<AffinityResult[]> {
    // Obtener usuarios disponibles y activos
    const availableUsers = await this.prisma.user.findMany({
      where: {
        available: true,
        isActive: true,
        userType: { in: ['employee', 'both'] }
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

    const affinityResults: AffinityResult[] = [];

    for (const user of availableUsers) {
      try {
        const affinity = await this.calculateAffinity(user.id, jobId);
        
        if (affinity.isEligible && affinity.affinityPercentage >= minAffinityPercentage) {
          affinityResults.push(affinity);
        }
      } catch (error) {
        console.error(`Error calculando afinidad para usuario ${user.id}:`, error);
      }
    }

    // Ordenar por puntuación de afinidad descendente
    return affinityResults
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
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
    const activeJobs = await this.prisma.job.findMany({
      where: {
        isActive: true
      }
    });

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

  private calculateAvailabilityScore(user: any, job: any, weight: number): number {
    if (!user.available || !user.isActive) return 0;
    return weight; // Puntuación completa si está disponible
  }

  private calculateLocationScore(user: any, job: any, weight: number): number {
    if (!user.residenceLocation || !job.location) return weight * 0.5; // Puntuación media si no hay datos
    
    const userLocation = user.residenceLocation;
    const jobLocation = job.location;
    
    // Coincidencia exacta de ciudad y país
    if (userLocation.city === jobLocation.city && userLocation.country === jobLocation.country) {
      return weight;
    }
    
    // Coincidencia de país solamente
    if (userLocation.country === jobLocation.country) {
      return weight * 0.7;
    }
    
    // Trabajo remoto
    if (jobLocation.remote === true) {
      return weight * 0.8;
    }
    
    return 0;
  }

  private calculateLanguageScore(user: any, job: any, weight: number): number {
    if (!job.languages || job.languages.length === 0) return weight; // Si no requiere idiomas específicos
    if (!user.employeeProfile?.spokenLanguages) return 0;
    
    const userLanguages = user.employeeProfile.spokenLanguages;
    const requiredLanguages = job.languages;
    
    const matchedLanguages = requiredLanguages.filter(lang => 
      userLanguages.some(userLang => userLang.toLowerCase() === lang.toLowerCase())
    );
    
    const matchPercentage = matchedLanguages.length / requiredLanguages.length;
    return Math.round(weight * matchPercentage);
  }

  private calculateInterestScore(user: any, job: any, weight: number): number {
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

  private calculateExperienceScore(user: any, job: any, weight: number): number {
    if (!job.requiredExperience) return weight; // Si no requiere experiencia específica
    if (!user.employeeProfile?.experiences) return 0;
    
    const userExperience = this.calculateTotalExperience(user.employeeProfile.experiences);
    
    if (userExperience >= job.requiredExperience) {
      return weight;
    } else if (userExperience >= job.requiredExperience * 0.7) {
      return weight * 0.8;
    } else if (userExperience >= job.requiredExperience * 0.5) {
      return weight * 0.5;
    }
    
    return 0;
  }

  private calculateEducationScore(user: any, job: any, weight: number): number {
    if (!job.requiredEducation) return weight; // Si no requiere educación específica
    if (!user.employeeProfile?.education) return 0;
    
    const educationLevels = {
      'primaria': 1,
      'secundaria': 2,
      'bachillerato': 3,
      'tecnico': 4,
      'universitario': 5,
      'posgrado': 6,
      'maestria': 7,
      'doctorado': 8
    };
    
    const requiredLevel = educationLevels[job.requiredEducation.toLowerCase()] || 0;
    const userMaxLevel = Math.max(...user.employeeProfile.education.map(edu => 
      educationLevels[edu.educationType?.toLowerCase()] || 0
    ));
    
    if (userMaxLevel >= requiredLevel) {
      return weight;
    } else if (userMaxLevel >= requiredLevel - 1) {
      return weight * 0.7;
    }
    
    return 0;
  }

  private calculateSkillsScore(user: any, job: any, weight: number): number {
    if (!user.employeeProfile?.skills) return 0;
    
    const userSkills = user.employeeProfile.skills.toLowerCase();
    const jobKeywords = this.extractJobKeywords(job).map(k => k.toLowerCase());
    
    const matchedSkills = jobKeywords.filter(keyword => 
      userSkills.includes(keyword)
    );
    
    const matchPercentage = Math.min(matchedSkills.length / Math.max(jobKeywords.length * 0.3, 1), 1);
    return Math.round(weight * matchPercentage);
  }

  private calculateScheduleScore(user: any, job: any, weight: number): number {
    if (!job.schedule) return weight; // Si no especifica horario
    
    // Lógica simplificada - en producción sería más compleja
    const flexibleSchedules = ['flexible', 'remoto', 'medio tiempo', 'part-time'];
    const isFlexible = flexibleSchedules.some(schedule => 
      job.schedule.toLowerCase().includes(schedule)
    );
    
    return isFlexible ? weight : weight * 0.7;
  }

  private calculateSalaryScore(user: any, job: any, weight: number): number {
    if (!job.salary) return weight; // Si no especifica salario
    
    // Lógica simplificada - idealmente compararía con expectativas del usuario
    // Por ahora, asumimos que cualquier salario es aceptable
    return weight;
  }

  private calculateAgeScore(user: any, job: any, weight: number): number {
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

  private calculateRatingScore(user: any, job: any, weight: number): number {
    if (!user.rating || user.totalRatings === 0) return weight * 0.5;
    
    const ratingPercentage = user.rating / 5.0; // Normalizar a porcentaje
    return Math.round(weight * ratingPercentage);
  }

  private calculateMembershipScore(user: any, job: any, weight: number): number {
    const membershipBonus = {
      'FREE': 0,
      'PREMIUM': 0.5,
      'VIP': 1
    };
    
    const bonus = membershipBonus[user.userMembershipPlan] || 0;
    return Math.round(weight * bonus);
  }

  private checkEligibility(user: any, job: any, breakdown: any): { isEligible: boolean; reasons: string[] } {
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
    
    if (job.languages && job.languages.length > 0 && breakdown.languages === 0) {
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
}