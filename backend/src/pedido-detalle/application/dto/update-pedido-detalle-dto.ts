import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdatePedidoDetalleDTO {
  @ApiPropertyOptional({
    description: 'Cantidad de productos',
    type: Number,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  cantidad?: number;

  @ApiPropertyOptional({
    description: 'Precio unitario del producto',
    type: Number,
    example: 100.5,
  })
  @IsOptional()
  @IsNumber()
  precioUnitario?: number;
}
