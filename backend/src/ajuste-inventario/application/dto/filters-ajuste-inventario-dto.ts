import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAjusteInventarioDTO {
  @ApiPropertyOptional({
    description: 'Filtrar ajustes por ID de producto',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  productoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar ajustes por ID de usuario',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  usuarioId?: number;

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
