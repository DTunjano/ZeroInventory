import { IsOptional, IsNumber, Min, IsEnum, IsInt } from 'class-validator';
import {
  TipoMovimientoEnum,
  TipoReferenciaEnum,
} from '../../domain/entity/kardex.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateKardexDTO {
  @ApiPropertyOptional({
    description: 'ID del producto asociado al movimiento de inventario',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El producto ID debe ser un número' })
  @Min(1, { message: 'El producto ID debe ser mayor a 0' })
  productoId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de movimiento de inventario (ENTRADA, SALIDA o AJUSTE)',
    example: 'ENTRADA',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim().toUpperCase())
  @IsEnum(TipoMovimientoEnum, {
    message: 'El tipo de movimiento debe ser ENTRADA, SALIDA o AJUSTE',
  })
  tipoMovimiento?: TipoMovimientoEnum;

  @ApiPropertyOptional({
    description: 'Cantidad del movimiento de inventario',
    example: 10,
  })
  @IsOptional()
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad?: number;

  @ApiPropertyOptional({
    description: 'Costo unitario del movimiento de inventario',
    example: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El costo unitario debe ser un número' })
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  costoUnitario?: number;

  @ApiPropertyOptional({
    description:
      'ID de la referencia asociada al movimiento de inventario (Si es una venta, compra o ajuste referenciala a su id correspondiente)',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La referencia ID debe ser un número' })
  @Min(1, { message: 'La referencia ID debe ser mayor a 0' })
  referenciaId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de referencia asociada al movimiento de inventario',
    example: 'COMPRA',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim().toUpperCase())
  @IsEnum(TipoReferenciaEnum, {
    message: 'El tipo de referencia debe ser COMPRA, VENTA o AJUSTE',
  })
  tipoReferencia?: TipoReferenciaEnum;
}
