import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Contraseña actual del usuario' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  currentPassword!: string;

  @ApiProperty({ description: 'Nueva contraseña' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword!: string;

  @ApiProperty({ description: 'Confirmar nueva contraseña' })
  @IsNotEmpty({ message: 'Debes confirmar la nueva contraseña' })
  confirmPassword!: string;
}
