import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateCarritoDetalleDTO {
  @ApiPropertyOptional({
    description: 'Cantidad del producto',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo' })
  cantidad?: number;
}
