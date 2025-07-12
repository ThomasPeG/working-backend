import { Employee } from "./employee.interface";
import { Job } from "./job.interface";
import { User } from "./user.interface";
import { Education } from "./education.interface";
import { Experience } from "./experience.interface";

export interface Response {
  access_token: string | null;
  data: any
              // {user: User} | 
              // {users: User[]} | 
              // {job: Job} |
              // {jobs: Job[]}|
              // {employee: Employee}|
              // {employees: Employee[]}|
              // {education: Education}|
              // {education: Education[]}|
              // {experience: Experience}|
              // {experience: Experience[]};
  message: string;
}

// Nueva interfaz para respuestas de Socket
export interface SocketResponse {
  event: string;           // Tipo de evento (notification, message, jobUpdate, etc.)
  data: any;              // Datos del evento
  message: string;        // Mensaje descriptivo
  timestamp: Date;        // Timestamp del evento
  success: boolean;       // Indica si la operación fue exitosa
}