import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm'; 
import { Job } from '../job/job.entity';
import { Employee } from '../employee/employee.entity';

@Entity('users') 
export class User { 
  @PrimaryGeneratedColumn('uuid') 
  id: string; 

  @Column({ unique: true }) 
  email: string; 

  @Column({ nullable: true }) 
  password: string; 

  @Column({ nullable: true }) 
  name: string; 

  @Column({ nullable: true }) 
  profilePhoto: string; 

  @Column({ nullable: true }) 
  gender: string; 

  @Column({ nullable: true }) 
  birthDate: Date

  @Column({ default: 'employee' }) 
  userType: string; // 'employee' o 'employer' 

  // Relación con trabajos (para empleadores)
  @OneToMany(() => Job, job => job.employer)
  jobs: Job[];

  // Relación con perfil de empleado (para empleados)
  @OneToOne(() => Employee, employee => employee.user)
  employeeProfile: Employee;

  @Column({ nullable: true, type: 'json' }) 
  location: { latitude: number; longitude: number }; 

  @CreateDateColumn() 
  createdAt: Date; 

  @UpdateDateColumn() 
  updatedAt: Date; 
}