import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateCategoriaProductoDTO {
  @ApiPropertyOptional({
    description: 'ID de la categoría',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @IsNumber()
  categoriaId!: number;

  @ApiPropertyOptional({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsNumber()
  productoId!: number;
}
