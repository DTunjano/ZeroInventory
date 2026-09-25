import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateCarritoDetalleDTO {
  @ApiProperty({
    description: 'ID del carrito',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del carrito es obligatorio' })
  @IsNumber({}, { message: 'El ID del carrito debe ser un número' })
  carritoId!: number;

  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  productoId!: number;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo' })
  cantidad!: number;
}
