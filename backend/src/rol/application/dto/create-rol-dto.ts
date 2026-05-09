import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RolNombreEnum } from '../../domain/entity/rol.entity';

export class CreateRolDTO {
  @ApiProperty({
    description: 'Nombre del rol',
    enum: RolNombreEnum,
    example: RolNombreEnum.ADMIN,
  })
  @IsNotEmpty()
  @IsEnum(RolNombreEnum)
  nombre!: RolNombreEnum;
}
