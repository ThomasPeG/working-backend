import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMembershipDto {
  @IsEnum(['FREE', 'PREMIUM', 'VIP'], { 
    message: 'El plan de membresía debe ser FREE, PREMIUM o VIP' 
  })
  @IsNotEmpty({ message: 'El plan de membresía es requerido' })
  userMembershipPlan: 'FREE' | 'PREMIUM' | 'VIP';
}