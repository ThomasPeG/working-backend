import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateFriendshipDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del destinatario es requerido' })
  addresseeId: string;

  @IsOptional()
  @IsEnum(['pending', 'accepted', 'rejected'], { message: 'El estado debe ser "pending", "accepted" o "rejected"' })
  status?: string = 'pending';
}