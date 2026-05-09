import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCategoriaDTO {
  @ApiPropertyOptional({
    description: 'Nombre de la categoría',
    example: 'Electrónica',
    type: String,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  nombre!: string;
}
