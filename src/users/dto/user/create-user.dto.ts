import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDate, IsEnum, IsArray, ValidateNested, IsObject, IsBoolean } from 'class-validator'; 
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

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

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  birthplace?: { city: string; country: string };

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  residenceLocation?: { city: string; country: string }; // Nueva propiedad

  @IsBoolean()
  @IsOptional()
  useGPS?: boolean; // Nueva propiedad

  @IsBoolean()
  @IsOptional()
  available?: boolean = true; // Nuevo campo: disponible para ofertas de trabajo

  @IsEnum(['employee', 'employer', 'not_sure', 'both'])
  @IsOptional() 
  userType?: string = 'employee'; 

  @IsOptional() 
  location?: { latitude: number; longitude: number }; 
  
  @IsArray() 
  @IsOptional() 
  interests?: string[]; 
}
