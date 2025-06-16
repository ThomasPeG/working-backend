import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Experience } from '../experience/experience.entity';
import { Education } from '../education/education.entity';
import { IsOptional, IsString, IsArray } from 'class-validator';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  cv: string; // URL to CV file

  @OneToMany(() => Experience, experience => experience.employee, { cascade: true })
  experiences: Experience[];

  @OneToMany(() => Education, education => education.employee, { cascade: true })
  education: Education[];

  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  interests: string[];

  @Column({ nullable: true, type: 'json' })
  @IsOptional()
  skills: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}