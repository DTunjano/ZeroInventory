import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCompraDTO {
  @ApiProperty({
    description: 'ID del proveedor',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del proveedor es obligatorio' })
  @IsNumber({}, { message: 'El ID del proveedor debe ser un número' })
  proveedorId!: number;

  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId!: number;

  @ApiProperty({
    description: 'Total de la compra',
    example: 1000.0,
    type: Number,
  })
  @IsNotEmpty({ message: 'El total es obligatorio' })
  @IsNumber({}, { message: 'El total debe ser un número' })
  total!: number;
}
