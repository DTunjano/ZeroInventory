import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNumber, IsPositive, IsString, IsEnum, Min, IsNotEmpty } from 'class-validator'
import { TipoMovimientoEnum, TipoReferenciaEnum } from '../../../kardex/infrastructure/persistence/kardex.orm-entity'

/**
 * DTO para crear un movimiento en Kárdex
 */
export class CreateKardexMovementDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  productoId!: number

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: TipoMovimientoEnum,
    example: TipoMovimientoEnum.SALIDA,
  })
  @IsEnum(TipoMovimientoEnum)
  tipoMovimiento!: TipoMovimientoEnum

  @ApiProperty({
    description: 'Cantidad del movimiento',
    example: 10,
  })
  @IsInt()
  @IsPositive()
  cantidad!: number

  @ApiProperty({
    description: 'Costo unitario del producto',
    example: 100.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  costoUnitario!: number

  @ApiProperty({
    description: 'Valor total (cantidad * costoUnitario)',
    example: 1005.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valorTotal!: number

  @ApiProperty({
    description: 'ID de referencia (pedidoId, ventaId, etc)',
    example: 42,
  })
  @IsInt()
  referenciaId!: number

  @ApiProperty({
    description: 'Tipo de referencia',
    enum: TipoReferenciaEnum,
    example: TipoReferenciaEnum.VENTA,
  })
  @IsEnum(TipoReferenciaEnum)
  tipoReferencia!: TipoReferenciaEnum
}

/**
 * DTO para registrar ajuste de inventario
 */
export class RegisterStockAdjustmentDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  productoId!: number

  @ApiProperty({
    description: 'Cantidad de cambio (siempre positiva, tipo_cambio indica dirección)',
    example: 50,
  })
  @IsInt()
  @IsPositive()
  cantidad!: number

  @ApiProperty({
    description: 'Stock anterior antes del ajuste',
    example: 100,
  })
  @IsInt()
  @Min(0)
  stockAnterior!: number

  @ApiProperty({
    description: 'Stock nuevo después del ajuste',
    example: 150,
  })
  @IsInt()
  @Min(0)
  stockNuevo!: number

  @ApiProperty({
    description: 'Motivo del ajuste',
    example: 'Recount de inventario físico',
  })
  @IsString()
  @IsNotEmpty()
  motivo!: string
}
