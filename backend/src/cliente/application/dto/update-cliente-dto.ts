import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { TipoDocumentoEnum } from '../../domain/entity/cliente.entity';

export class UpdateClienteDTO {
  @ApiPropertyOptional({
    description: 'ID del usuario asociado al cliente',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de documento',
    example: 'CC',
    enum: TipoDocumentoEnum,
  })
  @IsOptional()
  @IsEnum(TipoDocumentoEnum, {
    message: 'El tipo de documento debe ser CC, CE o PASAPORTE',
  })
  tipoDocumento?: TipoDocumentoEnum;

  @ApiPropertyOptional({
    description: 'Número de documento',
    example: '1234567890',
    type: String,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Transform(({ value }: { value: string }) => value?.trim())
  documento?: string;
}
