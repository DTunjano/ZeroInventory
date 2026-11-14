import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { COMPRA_ESTADOS } from '../../domain/compra-workflow.types';
import type { CompraEstado } from '../../domain/compra-workflow.types';

export class CompraLineaDTO {
  @ApiProperty() @IsInt() @Min(1) @Max(2147483647) productoId!: number;
  @ApiProperty() @IsInt() @Min(1) @Max(2147483647) cantidad!: number;
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999999.99)
  costoUnitario!: number;
}
export class CompraDraftDTO {
  @ApiProperty() @IsInt() @Min(1) @Max(2147483647) proveedorId!: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;
  @ApiProperty({ type: [CompraLineaDTO] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CompraLineaDTO)
  lineas!: CompraLineaDTO[];
}
export class CompraVersionDTO {
  @ApiProperty({ description: 'Versión obtenida al consultar la compra' })
  @IsInt()
  @Min(1)
  @Max(2147483646)
  version!: number;
}
export class CompraUpdateDTO extends CompraDraftDTO {
  @ApiProperty() @IsInt() @Min(1) @Max(2147483646) version!: number;
}
export class CompraCancelDTO extends CompraVersionDTO {
  @ApiProperty() @IsString() @MaxLength(1000) motivo!: string;
}
export class CompraQueryDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  proveedorId?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  usuarioId?: number;
  @ApiPropertyOptional({ enum: COMPRA_ESTADOS })
  @IsOptional()
  @IsIn(COMPRA_ESTADOS)
  estado?: CompraEstado;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
