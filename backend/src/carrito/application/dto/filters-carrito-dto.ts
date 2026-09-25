import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoCarritoEnum } from '../../domain/entity/carrito.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltersCarritoDTO {
  @ApiPropertyOptional({
    description: 'Filtrar carritos por ID de usuario',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar carritos por estado',
    enum: EstadoCarritoEnum,
    example: EstadoCarritoEnum.ABIERTO,
  })
  @IsOptional()
  @IsEnum(EstadoCarritoEnum)
  estado?: EstadoCarritoEnum;

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
