import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUsuarioDTO {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'john_doe',
    type: String,
  })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  @MinLength(3, {
    message: 'El nombre de usuario debe tener mínimo 3 caracteres',
  })
  username!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'SecurePassword123!',
    type: String,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Primer nombre del usuario',
    example: 'John',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  primerNombre!: string | null;

  @ApiPropertyOptional({
    description: 'Segundo nombre del usuario',
    example: 'Alexander',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  segundoNombre!: string | null;

  @ApiPropertyOptional({
    description: 'Primer apellido del usuario',
    example: 'Doe',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  primerApellido!: string | null;

  @ApiPropertyOptional({
    description: 'Segundo apellido del usuario',
    example: 'Smith',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim() || null)
  segundoApellido!: string | null;
}
