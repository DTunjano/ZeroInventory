import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemQuantityDTO {
  @ApiProperty({ description: 'Nueva cantidad', example: 3, type: Number })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;
}