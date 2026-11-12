import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateAjusteInventarioDTO {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  productoId!: number;

  @ApiProperty({
    description: 'ID del usuario que realiza el ajuste',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId!: number;

  @ApiProperty({
    description: 'Cantidad del ajuste',
    example: 10,
    type: Number,
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;

  @ApiProperty({
    description: 'Motivo del ajuste',
    example: 'Restock de productos',
    type: String,
  })
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  motivo!: string;
}
