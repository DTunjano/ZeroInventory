import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateDireccionDTO {
  @ApiProperty({
    description: 'ID del cliente',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  @IsNumber()
  clienteId!: number;

  @ApiProperty({
    description: 'Línea de dirección',
    example: 'Calle 10 No. 20-30',
    type: String,
  })
  @IsNotEmpty({ message: 'La línea de dirección es obligatoria' })
  @Transform(({ value }: { value: string }) => value.trim())
  lineaDir!: string;

  @ApiProperty({
    description: 'Barrio',
    example: 'Centro',
    type: String,
  })
  @IsNotEmpty({ message: 'El barrio es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  barrio!: string;

  @ApiPropertyOptional({
    description: 'Código postal',
    example: '080001',
    type: String,
  })
  @IsOptional()
  codigoPostal!: string | null;

  @ApiPropertyOptional({
    description: 'Información adicional',
    example: 'Apartamento 305',
    type: String,
  })
  @IsOptional()
  infoAdiccional!: string | null;
}
