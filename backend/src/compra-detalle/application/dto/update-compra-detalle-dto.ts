import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateCompraDetalleDTO {
  @ApiPropertyOptional({
    description: 'Cantidad del producto',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad?: number;

  @ApiPropertyOptional({
    description: 'Costo unitario del producto',
    example: 100.0,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El costo unitario debe ser un número' })
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  costoUnitario?: number;
}
