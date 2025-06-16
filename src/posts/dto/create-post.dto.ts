import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsOptional()
  location?: { latitude: number; longitude: number } | null;

  @IsArray()
  @IsOptional()
  tags?: string[];
}