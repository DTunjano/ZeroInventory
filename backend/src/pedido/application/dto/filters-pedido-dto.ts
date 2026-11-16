import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsEnum, IsOptional, Max, Min } from 'class-validator';
import { EstadoPedidoEnum } from '../../domain/entity/pedido.entity';

export class FiltersPedidoDTO {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de cliente',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1) @Max(2147483647)
  clienteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de dirección',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1) @Max(2147483647)
  direccionId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: EstadoPedidoEnum,
    example: 'PENDIENTE',
  })
  @IsOptional()
  @IsEnum(EstadoPedidoEnum)
  estado?: EstadoPedidoEnum;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt() @Max(1000000)
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Número de registros por página para paginación',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
