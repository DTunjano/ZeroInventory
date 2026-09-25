import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateDireccionDTO {
  @ApiPropertyOptional({
    description: 'Línea de dirección',
    example: 'Calle 10 No. 20-30',
    type: String,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'La línea de dirección es obligatoria' })
  @Transform(({ value }: { value: string }) => value.trim())
  lineaDir!: string;

  @ApiPropertyOptional({
    description: 'Barrio',
    example: 'Centro',
    type: String,
  })
  @IsOptional()
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
