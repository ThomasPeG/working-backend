import { IsNotEmpty, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del receptor es requerido' })
  receiverId: string;

  @IsString()
  @IsNotEmpty({ message: 'El contenido del mensaje es requerido' })
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}