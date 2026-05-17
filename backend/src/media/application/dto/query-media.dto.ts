import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

/**
 * DTO para queries de búsqueda y filtros
 */
export class QueryMediaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10

  @IsString()
  @IsOptional()
  search?: string

  @IsIn(['video', 'image'])
  @IsOptional()
  tipo?: 'video' | 'image'

  @IsIn(['activo', 'inactivo'])
  @IsOptional()
  estado?: 'activo' | 'inactivo'
}
