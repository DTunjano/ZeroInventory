import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltersCarritoDetalleDTO {
  @ApiPropertyOptional({
    description: 'Filtrar detalles por ID de carrito',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  carritoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar detalles por ID de producto',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  productoId?: number;

  //Pagination
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Número de registros por página para paginación',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;
}
