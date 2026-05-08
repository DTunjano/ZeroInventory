import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { TipoDocumentoEnum } from '../../domain/entity/cliente.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltersClienteDTO {
  @ApiPropertyOptional({
    description: 'Filtrar clientes por ID de usuario',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar clientes por tipo de documento',
    enum: TipoDocumentoEnum,
    example: TipoDocumentoEnum.CC,
  })
  @IsOptional()
  @IsEnum(TipoDocumentoEnum)
  tipoDocumento?: TipoDocumentoEnum;

  @ApiPropertyOptional({
    description: 'Filtrar clientes por número de documento',
    type: String,
    example: '123456789',
  })
  @IsOptional()
  documento?: string;

  //Pagination
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Número de registros por página para paginación',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;
}
