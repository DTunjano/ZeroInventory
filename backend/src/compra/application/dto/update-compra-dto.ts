import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCompraDTO {
  @ApiPropertyOptional({
    description: 'ID del proveedor',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del proveedor debe ser un número' })
  proveedorId?: number;

  @ApiPropertyOptional({
    description: 'ID del usuario',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Total de la compra',
    example: 1000.0,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El total debe ser un número' })
  total?: number;
}
