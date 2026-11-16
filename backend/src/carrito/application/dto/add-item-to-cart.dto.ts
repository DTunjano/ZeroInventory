import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AddItemToCartDTO {
  @ApiProperty({ description: 'ID del producto', example: 1, type: Number })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId!: number;

  @ApiProperty({ description: 'Cantidad a agregar', example: 2, type: Number })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;
}
