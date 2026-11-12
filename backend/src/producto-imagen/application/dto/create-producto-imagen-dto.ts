import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateProductoImagenDTO {
  @ApiProperty({
    description: 'ID del producto asociado a la imagen',
    example: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsInt({ message: 'El ID del producto debe ser un entero' })
  @Min(1)
  productoId!: number;
}
