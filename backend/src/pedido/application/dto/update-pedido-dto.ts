import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { EstadoPedidoEnum } from '../../domain/entity/pedido.entity';

export class UpdatePedidoDTO {
  @ApiPropertyOptional({
    description: 'ID de la dirección',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  direccionId?: number;

  @ApiPropertyOptional({
    description: 'Estado del pedido',
    example: 'PENDIENTE',
    enum: EstadoPedidoEnum,
  })
  @IsOptional()
  estado?: EstadoPedidoEnum;

  @ApiPropertyOptional({
    description: 'Total del pedido',
    example: 150000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  total?: number;
}
