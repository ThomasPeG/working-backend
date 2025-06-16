import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDate, IsEnum, IsArray } from 'class-validator'; 
import { Type } from 'class-transformer';

export class CreateUserDto { 
  @IsEmail() 
  @IsNotEmpty() 
  email: string; 

  @IsString() 
  @IsOptional()
  password?:string;

  @IsString() 
  @IsOptional()
  name?: string; 

  @IsString() 
  @IsOptional() 
  profilePhoto?: string; 

  @IsString() 
  @IsOptional() 
  gender?: string; 

  @Type(() => Date)
  @IsDate() 
  @IsOptional() 
  birthDate?: Date; 

  @IsEnum(['employee', 'employer']) 
  @IsOptional() 
  userType?: string = 'employee'; 

  @IsString() 
  @IsOptional() 
  education?: string; 

  @IsString() 
  @IsOptional() 
  experience?: string; 

  @IsOptional() 
  location?: { latitude: number; longitude: number }; 

  @IsString() 
  @IsOptional() 
  jobDetails?: string; 

  @IsString() 
  @IsOptional() 
  schedule?: string; 

  @IsString() 
  @IsOptional() 
  salary?: string; 

  @IsArray() 
  @IsOptional() 
  interests?: string[]; 
}