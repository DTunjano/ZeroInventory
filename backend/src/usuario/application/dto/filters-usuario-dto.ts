import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FiltersUsuarioDTO {
  @ApiPropertyOptional({
    description: 'Filtrar usuarios por username',
    type: String,
    example: 'WILDKILL',
  })
  @IsOptional()
  @IsString()
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
  @Transform(({ value }: { value: unknown }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  isActive?: boolean;

  //Pagination
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Número de registros por página para paginación',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
