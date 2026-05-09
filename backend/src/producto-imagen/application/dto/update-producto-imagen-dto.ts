import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateProductoImagenDTO {
  @ApiPropertyOptional({
    description: 'ID del producto asociado a la imagen',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  productoId?: number;
}
