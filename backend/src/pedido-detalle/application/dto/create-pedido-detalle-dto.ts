import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePedidoDetalleDTO {
  @ApiProperty({
    description: 'ID del pedido',
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  pedidoId!: number;

  @ApiProperty({
    description: 'ID del producto',
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  productoId!: number;

  @ApiProperty({
    description: 'Cantidad de productos',
    type: Number,
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  cantidad!: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    type: Number,
    example: 100.5,
  })
  @IsNotEmpty()
  @IsNumber()
  precioUnitario!: number;
}
