import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FiltersPedidoDetalleDTO {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del pedido',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1) @Max(2147483647)
  pedidoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del producto',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1) @Max(2147483647)
  productoId?: number;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
