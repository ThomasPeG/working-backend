import { 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID, 
  IsArray, 
  IsEnum, 
  IsUrl, 
  ValidateNested, 
  ValidateIf 
} from 'class-validator';
import { Type } from 'class-transformer';

// Enum para tipos de mensaje
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  LINK = 'link'
}

// Clase para vista previa de enlaces
export class LinkPreviewDto {
  @IsString()
  @IsNotEmpty({ message: 'El título del enlace es requerido' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del enlace es requerida' })
  description: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsNotEmpty({ message: 'La URL del enlace es requerida' })
  url: string;
}

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

  // NUEVOS CAMPOS PARA MULTIMEDIA
  @IsEnum(MessageType, { message: 'Tipo de mensaje inválido' })
  @IsOptional()
  type?: MessageType;

  // mediaUrl es requerido si type es 'image' o 'document'
  @ValidateIf(o => o.type === MessageType.IMAGE || o.type === MessageType.DOCUMENT)
  @IsString({ message: 'La URL del archivo es requerida para imágenes y documentos' })
  @IsNotEmpty({ message: 'La URL del archivo no puede estar vacía' })
  @IsOptional()
  mediaUrl?: string;

  // fileName solo es válido con type: 'document'
  @ValidateIf(o => o.type === MessageType.DOCUMENT)
  @IsString({ message: 'El nombre del archivo debe ser una cadena' })
  @IsNotEmpty({ message: 'El nombre del archivo es requerido para documentos' })
  @IsOptional()
  fileName?: string;

  // linkPreview es requerido si type es 'link'
  @ValidateIf(o => o.type === MessageType.LINK)
  @ValidateNested()
  @Type(() => LinkPreviewDto)
  @IsNotEmpty({ message: 'La vista previa del enlace es requerida para mensajes de tipo link' })
  @IsOptional()
  linkPreview?: LinkPreviewDto;
}