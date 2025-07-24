import { ObjectId } from "mongoose";
import { JobType } from "src/jobs/schemas/job-type.schema";

export interface IJob {
  _id?: string;
  userId: string;
  title: string;
  description: string;
  place?: string | null;
  jobType?: string | ObjectId | null;  // Cambiar de 'string' a 'string | ObjectId | null'
  jobTypeNew?: string | null;
  salary?: number | null;
  salaryCycle?: string | null;
  schedule?: string | null;
  timeCommitment?: string | null;
  requiredLanguages: string[];
  requiredExperience: boolean;
  requiredEducation: boolean;
  requiredAge?: number | null;
  contractType?: string | null;
  images: string[];
  isActive: boolean;
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para crear un nuevo trabajo (sin campos auto-generados)
export interface ICreateJob {
  userId: string;
  title: string;
  description: string;
  place?: string;
  jobType?: string;
  salary?: number;
  salaryCycle?: string;
  schedule?: string;
  timeCommitment?: string;
  requiredLanguages?: string[];
  requiredExperience?: boolean;
  requiredEducation?: boolean;
  requiredAge?: number;
  contractType?: string;
  images?: string[];
}

// Interfaz para actualizar un trabajo (todos los campos opcionales excepto ID)
export interface IUpdateJob {
  title?: string;
  description?: string;
  place?: string;
  jobType?: string;
  salary?: number;
  salaryCycle?: string;
  schedule?: string;
  timeCommitment?: string;
  requiredLanguages?: string[];
  requiredExperience?: boolean;
  requiredEducation?: boolean;
  requiredAge?: number;
  contractType?: string;
  images?: string[];
  isActive?: boolean;
}

// Interfaz para respuesta de trabajos con información del usuario
export interface IJobWithUser extends IJob {
  user?: {
    id: string;
    name?: string;
    email: string;
    profilePhoto?: string;
    rating?: number;
    userType: string;
  };
}

// Interfaz para paginación de trabajos
export interface IJobsPagination {
  jobs: IJobWithUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

