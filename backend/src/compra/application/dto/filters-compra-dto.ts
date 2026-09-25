import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCompraDTO {
  @ApiPropertyOptional({
    description: 'Filtrar compras por ID de proveedor',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  proveedorId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar compras por ID de usuario',
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
  @Max(100)
  limit?: number = 10;
}
