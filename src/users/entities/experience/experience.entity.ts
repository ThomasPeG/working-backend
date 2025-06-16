import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, employee => employee.experiences)
  employee: Employee;

  @Column()
  @IsNotEmpty({ message: 'Job position is required' })
  @IsString()
  position: string;

  @Column()
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  company: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @Column()
  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate: Date;

  @Column({ default: false })
  @IsBoolean()
  currentlyWorking: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}