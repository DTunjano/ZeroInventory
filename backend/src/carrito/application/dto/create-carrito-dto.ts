import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { EstadoCarritoEnum } from '../../domain/entity/carrito.entity';
import { Transform } from 'class-transformer';

export class CreateCarritoDTO {
  @ApiProperty({
    description: 'ID del usuario asociado al carrito',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId!: number;

  @ApiProperty({
    description: 'Estado del carrito',
    example: 'ABIERTO',
    enum: EstadoCarritoEnum,
  })
  @IsNotEmpty({ message: 'El estado del carrito es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim().toUpperCase())
  @IsEnum(EstadoCarritoEnum, {
    message: 'El estado debe ser ABIERTO o CERRADO',
  })
  estado!: EstadoCarritoEnum;
}
