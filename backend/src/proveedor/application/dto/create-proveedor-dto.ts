import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProveedorDTO {
  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Proveedor XYZ',
    type: String,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Transform(({ value }: { value: string }) => value.trim())
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Teléfono del proveedor',
    example: '3001294567',
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
}
