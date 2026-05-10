import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCompraDetalleDTO {
  @ApiProperty({
    description: 'ID de la compra',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID de la compra es obligatorio' })
  @IsNumber({}, { message: 'El ID de la compra debe ser un número' })
  compraId!: number;

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
    example: 5,
    type: Number,
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;

  @ApiProperty({
    description: 'Costo unitario del producto',
    example: 100.0,
    type: Number,
  })
  @IsNotEmpty({ message: 'El costo unitario es obligatorio' })
  @IsNumber({}, { message: 'El costo unitario debe ser un número' })
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  costoUnitario!: number;
}
