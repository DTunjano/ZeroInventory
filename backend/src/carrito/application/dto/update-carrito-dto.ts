import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoCarritoEnum } from '../../domain/entity/carrito.entity';
import { Transform } from 'class-transformer';

export class UpdateCarritoDTO {
  @ApiPropertyOptional({
    description: 'Estado del carrito',
    example: 'ABIERTO',
    enum: EstadoCarritoEnum,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value.trim().toUpperCase())
  @IsEnum(EstadoCarritoEnum, {
    message: 'El estado debe ser ABIERTO o CERRADO',
  })
  estado?: EstadoCarritoEnum;
}
