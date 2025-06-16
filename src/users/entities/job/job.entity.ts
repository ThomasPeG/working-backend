import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.jobs)
  employer: User;

  @Column()
  @IsNotEmpty({ message: 'Job title is required' })
  @IsString()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Job description is required' })
  @IsString()
  description: string;

  @Column()
  @IsNotEmpty({ message: 'Schedule is required' })
  @IsString()
  schedule: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  salary: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  requiredExperience: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  requiredEducation: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(18, { message: 'Minimum age must be at least 18' })
  @Max(100, { message: 'Maximum age must be reasonable' })
  requiredAge: number;

  @Column({ nullable: true, type: 'json' })
  @IsOptional()
  location: { latitude: number; longitude: number; address: string };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}