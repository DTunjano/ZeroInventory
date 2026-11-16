import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { MetodoPagoEnum } from '../../../pago/domain/entity/pago.entity';

export class CheckoutCartDTO {
  @ApiProperty({ description: 'ID de la dirección de envío', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  direccionId!: number;

  @ApiProperty({
    description: 'Método de pago',
    enum: MetodoPagoEnum,
    example: MetodoPagoEnum.EFECTIVO,
  })
  @IsEnum(MetodoPagoEnum)
  metodoPago!: MetodoPagoEnum;
}
