import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCategoriaProductoDTO {
  @ApiProperty({
    description: 'ID de la categoría',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @IsNumber()
  categoriaId!: number;

  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsNumber()
  productoId!: number;
}
