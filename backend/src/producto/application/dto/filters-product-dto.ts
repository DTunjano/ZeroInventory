import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

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
    description: 'Búsqueda general (aplica a nombre y SKU)',
    type: String,
    example: 'destapador',
  })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar productos por marca',
    type: String,
    example: 'Cristal',
  })
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo del producto',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return value;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de categoría',
    type: Number,
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  categoriaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por múltiples IDs de categoría',
    type: [Number],
    example: [1, 3],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return value
    const values = Array.isArray(value) ? value : [value]
    return values
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item))
  })
  @Type(() => Number)
  categoriaIds?: number[];

  @ApiPropertyOptional({
    description: 'Campo para ordenar. Valores: stock | categoria | nombre',
    type: String,
    example: 'stock',
  })
  @IsOptional()
  sortBy?: 'stock' | 'categoria' | 'nombre';

  @ApiPropertyOptional({
    description: 'Orden para ordenamiento: asc | desc',
    type: String,
    example: 'desc',
  })
  @IsOptional()
  order?: 'asc' | 'desc';

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
