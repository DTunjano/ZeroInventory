import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ActualizarEmpleadoDTO {
  @ApiPropertyOptional({
    description: 'Nombre completo del empleado',
    example: 'Juan Pérez Actualizado',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @Transform(({ value }: { value: string }) =>
    value ? value.trim() : undefined,
  )
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del empleado',
    example: 'juan.perez@empresa.com',
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  @Transform(({ value }: { value: string }) =>
    value ? value.trim().toLowerCase() : undefined,
  )
  email?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña (opcional)',
    example: 'NuevaPass123!',
    type: String,
  })
  @IsOptional()
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  password?: string;

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
