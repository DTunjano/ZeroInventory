import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CrearEmpleadoDTO {
  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'Juan Pérez',
    type: String,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @Transform(({ value }: { value: string }) => value.trim())
  nombre!: string;

  @ApiProperty({
    description: 'Correo electrónico del empleado',
    example: 'juan.perez@empresa.com',
    type: String,
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'El email no es válido' })
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email!: string;

  @ApiProperty({
    description: 'Contraseña del empleado',
    example: 'SecurePass123!',
    type: String,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'Número de documento del empleado',
    example: '1234567890',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El documento debe ser un texto' })
  @Transform(({ value }: { value: string }) =>
    value ? value.trim() : null,
  )
  documento?: string | null;

  @ApiPropertyOptional({
    description: 'Teléfono del empleado',
    example: '0991234567',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @Transform(({ value }: { value: string }) =>
    value ? value.trim() : null,
  )
  telefono?: string | null;
}
