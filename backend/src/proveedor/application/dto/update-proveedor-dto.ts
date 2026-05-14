import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProveedorDTO {
  @ApiPropertyOptional({
    description: 'Nombre del proveedor',
    example: 'Proveedor XYZ',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Transform(({ value }: { value: string }) => value?.trim())
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Nombre del representante o titular de la empresa',
    example: 'Juan Pérez',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del titular debe ser una cadena de texto' })
  @Transform(({ value }: { value: string }) => value?.trim())
  nombreTitular?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del proveedor',
    example: '3001234567',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Transform(({ value }: { value: string }) => value?.trim())
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email del proveedor',
    example: 'proveedor@example.com',
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  @Transform(({ value }: { value: string }) => value?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Estado del proveedor',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
