import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateCategoriaDTO {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Electrónica',
    type: String,
  })
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  nombre!: string;
}
