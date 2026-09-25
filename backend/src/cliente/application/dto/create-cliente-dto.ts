import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TipoDocumentoEnum } from '../../domain/entity/cliente.entity';

export class CreateClienteDTO {
  @ApiProperty({
    description: 'ID del usuario asociado al cliente',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId!: number;

  @ApiProperty({
    description: 'Tipo de documento',
    example: 'CC',
    enum: TipoDocumentoEnum,
  })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  @IsEnum(TipoDocumentoEnum, {
    message: 'El tipo de documento debe ser CC, CE o PASAPORTE',
  })
  tipoDocumento!: TipoDocumentoEnum;

  @ApiProperty({
    description: 'Número de documento',
    example: '1234567890',
    type: String,
  })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  documento!: string;
}
