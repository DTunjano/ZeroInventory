import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FilterProveedorDTO {
  @ApiPropertyOptional({
    description: 'Filtrar proveedores por nombre',
    type: String,
    example: 'Proveedor XYZ',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Filtrar proveedores por email',
    type: String,
    example: 'proveedor@example.com',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de registros por página para paginación',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}
