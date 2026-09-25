import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, Max, Min, IsNumber } from 'class-validator';
import { RolNombreEnum } from '../../domain/entity/rol.entity';

export class FiltersRolDTO {
  @ApiPropertyOptional({
    description: 'Filtrar por nombre de rol',
    enum: RolNombreEnum,
    example: RolNombreEnum.ADMIN,
  })
  @IsOptional()
  @IsEnum(RolNombreEnum)
  nombre?: RolNombreEnum;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
