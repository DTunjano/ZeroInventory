import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateUsuarioRolDTO {
  @ApiProperty({
    description: 'ID del usuario',
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  usuarioId!: number;

  @ApiProperty({
    description: 'ID del rol',
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  rolId!: number;
}
