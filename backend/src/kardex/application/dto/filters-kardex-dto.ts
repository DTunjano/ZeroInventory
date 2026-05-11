import { IsOptional, Min, IsEnum, IsInt, Max } from 'class-validator';
import {
  TipoMovimientoEnum,
  TipoReferenciaEnum,
} from '../../domain/entity/kardex.entity';

export class FilterKardexDTO {
  @IsOptional()
  @IsEnum(TipoMovimientoEnum, {
    message: 'El tipo de movimiento debe ser ENTRADA, SALIDA o AJUSTE',
  })
  tipoMovimiento?: TipoMovimientoEnum;

  @IsOptional()
  @IsEnum(TipoReferenciaEnum, {
    message: 'El tipo de referencia debe ser COMPRA, VENTA o AJUSTE',
  })
  tipoReferencia?: TipoReferenciaEnum;

  @IsOptional()
  @IsInt({ message: 'El número de página debe ser un número entero' })
  @Min(1, { message: 'El número de página debe ser mayor a 0' })
  page?: number;

  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100)
  limit?: number;
}
