import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FiltersProductDTO {
  @IsOptional()
  sku?: string;

  @IsOptional()
  nombre?: string;

  @IsOptional()
  marca?: string;

  @IsOptional()
  @Type(() => Number)
  precioMin?: number;

  @IsOptional()
  @Type(() => Number)
  precioMax?: number;
}
