import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsEnum, IsOptional, Max, Min } from 'class-validator';
import {
  EstadoPagoEnum,
  MetodoPagoEnum,
} from '../../domain/entity/pago.entity';

export class FiltersPagoDTO {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del pedido',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pedidoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por método de pago',
    enum: MetodoPagoEnum,
    example: MetodoPagoEnum.TRANSFERENCIA,
  })
  @IsOptional()
  @IsEnum(MetodoPagoEnum)
  metodoPago?: MetodoPagoEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de pago',
    enum: EstadoPagoEnum,
    example: EstadoPagoEnum.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(EstadoPagoEnum)
  estado?: EstadoPagoEnum;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
