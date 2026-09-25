import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';

export class FiltersProductDTO {
  @ApiPropertyOptional({
    description: 'Filtrar productos por SKU',
    type: String,
    example: 'PRO-000000001',
  })
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Filtrar productos por nombre',
    type: String,
    example: 'Vaso',
  })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Filtrar productos por marca',
    type: String,
    example: 'Cristal',
  })
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({
    description: 'Precio mínimo del producto',
    type: Number,
    example: 20000,
  })
  @IsOptional()
  @Type(() => Number)
  precioMin?: number;

  @ApiPropertyOptional({
    description: 'Precio máximo del producto',
    type: Number,
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  precioMax?: number;

  //Pagination
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Número de registros por página para paginación',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 10;
}
