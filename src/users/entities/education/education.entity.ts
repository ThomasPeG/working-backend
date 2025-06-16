import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDateString, IsEnum } from 'class-validator';

// Enum para tipos de educación
enum EducationType {
  HIGHSCHOOL = 'highschool',
  TECHNICAL = 'technical',
  BACHELOR = 'bachelor',
  MASTER = 'master',
  DOCTORATE = 'doctorate',
  OTHER = 'other'
}

@Entity('education')
export class Education {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, employee => employee.education)
  employee: Employee;

  @Column({
    type: 'enum',
    enum: EducationType,
    default: EducationType.BACHELOR
  })
  @IsEnum(EducationType, { message: 'Invalid education type' })
  @IsNotEmpty({ message: 'Education type is required' })
  educationType: EducationType;

  @Column()
  @IsNotEmpty({ message: 'Institution name is required' })
  @IsString()
  institution: string;

  @Column()
  @IsNotEmpty({ message: 'Field of study is required' })
  @IsString()
  fieldOfStudy: string;

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
  currentlyStudying: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}