import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import {
  EstadoPagoEnum,
  MetodoPagoEnum,
} from '../../domain/entity/pago.entity';

export class CreatePagoDTO {
  @ApiProperty({
    description: 'ID del pedido',
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  pedidoId!: number;

  @ApiProperty({
    description: 'Método de pago',
    enum: MetodoPagoEnum,
    example: MetodoPagoEnum.TRANSFERENCIA,
  })
  @IsNotEmpty()
  @IsEnum(MetodoPagoEnum)
  metodoPago!: MetodoPagoEnum;

  @ApiProperty({
    description: 'Monto del pago',
    type: Number,
    example: 100.5,
  })
  @IsNotEmpty()
  @IsNumber()
  monto!: number;

  @ApiProperty({
    description: 'Estado del pago',
    enum: EstadoPagoEnum,
    example: EstadoPagoEnum.PENDIENTE,
  })
  @IsNotEmpty()
  @IsEnum(EstadoPagoEnum)
  estado!: EstadoPagoEnum;
}
