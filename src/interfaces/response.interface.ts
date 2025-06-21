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