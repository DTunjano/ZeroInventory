import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';

export class FiltersUsuarioDTO {
  @ApiPropertyOptional({
    description: 'Filtrar usuarios por username',
    type: String,
    example: 'WILDKILL',
  })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Filtrar usuarios por nombre',
    type: String,
    example: 'Wilder',
  })
  @IsOptional()
  primerNombre?: string;

  @ApiPropertyOptional({
    description: 'Filtrar usuarios por apellido',
    type: String,
    example: 'Gayming',
  })
  @IsOptional()
  primerApellido?: string;

  @ApiPropertyOptional({
    description: 'Filtrar usuarios por estado',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  //Pagination
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Número de registros por página para paginación',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 10;
}
