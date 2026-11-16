import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class PedidoCommandDTO {
  @ApiProperty() @IsInt() @Min(1) @Max(2147483646) version!: number;
  @ApiProperty() @IsString() @MaxLength(1000) motivo!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  pagoId?: number;
}
