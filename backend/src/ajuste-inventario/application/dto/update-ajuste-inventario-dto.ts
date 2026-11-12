import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAjusteInventarioDTO {
  @ApiPropertyOptional({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  productoId?: number;

  @ApiPropertyOptional({
    description: 'ID del usuario que realiza el ajuste',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Cantidad del ajuste',
    example: 10,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad?: number;

  @ApiPropertyOptional({
    description: 'Motivo del ajuste',
    example: 'Restock de productos',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  motivo?: string;
}
