import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { EstadoPedidoEnum } from '../../domain/entity/pedido.entity';

export class CreatePedidoDTO {
  @ApiProperty({
    description: 'ID del cliente',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  @IsNumber()
  clienteId!: number;

  @ApiProperty({
    description: 'ID de la dirección',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID de la dirección es obligatorio' })
  @IsNumber()
  direccionId!: number;

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
  @Min(0)
  total?: number;
}
