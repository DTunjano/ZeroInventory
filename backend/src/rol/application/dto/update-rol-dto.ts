import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RolNombreEnum } from '../../domain/entity/rol.entity';

export class UpdateRolDTO {
  @ApiPropertyOptional({
    description: 'Nombre del rol',
    enum: RolNombreEnum,
    example: RolNombreEnum.EMPLOYEE,
  })
  @IsOptional()
  @IsEnum(RolNombreEnum)
  nombre?: RolNombreEnum;
}
