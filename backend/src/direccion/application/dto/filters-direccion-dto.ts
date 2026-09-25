import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class FiltersDireccionDTO {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de cliente',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clienteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por barrio',
    type: String,
    example: 'Centro',
  })
  @IsOptional()
  barrio?: string;

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
