import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateUsuarioDTO {
  @ApiPropertyOptional({
    description: 'Nombre de usuario',
    example: 'john_doe',
    type: String,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @Transform(({ value }: { value: string }) => value?.trim())
  @MinLength(3, {
    message: 'El nombre de usuario debe tener mínimo 3 caracteres',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Contraseña del usuario',
    example: 'SecurePassword123!',
    type: String,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Primer nombre del usuario',
    example: 'John',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  primerNombre?: string | null;

  @ApiPropertyOptional({
    description: 'Segundo nombre del usuario',
    example: 'Alexander',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  segundoNombre?: string | null;

  @ApiPropertyOptional({
    description: 'Primer apellido del usuario',
    example: 'Doe',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  primerApellido?: string | null;

  @ApiPropertyOptional({
    description: 'Segundo apellido del usuario',
    example: 'Smith',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  segundoApellido?: string | null;

  @ApiPropertyOptional({
    description: 'Estado activo del usuario',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  isActive?: boolean;
}
