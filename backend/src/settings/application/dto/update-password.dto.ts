import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Contraseña actual del usuario' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  currentPassword!: string;

  @ApiProperty({ description: 'Nueva contraseña' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'La nueva contraseña debe incluir mayúsculas, minúsculas, números y símbolos',
  })
  newPassword!: string;

  @ApiProperty({ description: 'Confirmar nueva contraseña' })
  @IsNotEmpty({ message: 'Debes confirmar la nueva contraseña' })
  confirmPassword!: string;
}
