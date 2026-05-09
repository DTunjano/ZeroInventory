import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { EstadoPagoEnum, MetodoPagoEnum } from '../../domain/entity/pago.entity';

export class UpdatePagoDTO {
  @ApiPropertyOptional({
    description: 'Método de pago',
    enum: MetodoPagoEnum,
    example: MetodoPagoEnum.TRANSFERENCIA,
  })
  @IsOptional()
  @IsEnum(MetodoPagoEnum)
  metodoPago?: MetodoPagoEnum;

  @ApiPropertyOptional({
    description: 'Monto del pago',
    type: Number,
    example: 100.50,
  })
  @IsOptional()
  @IsNumber()
  monto?: number;

  @ApiPropertyOptional({
    description: 'Estado del pago',
    enum: EstadoPagoEnum,
    example: EstadoPagoEnum.APROBADO,
  })
  @IsOptional()
  @IsEnum(EstadoPagoEnum)
  estado?: EstadoPagoEnum;
}
