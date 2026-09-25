import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateUsuarioRolDTO {
  @ApiPropertyOptional({
    description: 'ID del rol',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  rolId?: number;
}
