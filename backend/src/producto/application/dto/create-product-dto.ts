import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateProductDTO {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Shaker',
    type: String,
  })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  nombre!: string;

  @ApiProperty({
    description: 'Cantidad disponible',
    example: 100,
    type: Number,
  })
  @IsNotEmpty({ message: 'La cantidad disponible es obligatoria' })
  @Min(0, { message: 'La cantidad disponible no puede ser negativa' })
  cantidad!: number;

  @ApiProperty({
    description: 'Precio del producto',
    example: 193000,
    type: Number,
  })
  @IsNotEmpty({ message: 'El precio del producto es obligatorio' })
  @Min(0, { message: 'El precio del producto no puede ser negativo' })
  precio!: number;

  @ApiPropertyOptional({
    description: 'Descripción del producto',
    example: 'Shaker de plástico resistente',
    type: String,
  })
  @IsOptional()
  descripcion!: string | null;

  @ApiPropertyOptional({
    description: 'Código SKU del producto',
    example: 'PRO-000000001',
    type: String,
  })
  @IsOptional()
  sku!: string;

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Brand Name',
    type: String,
  })
  @IsOptional()
  marca!: string | null;

  @ApiPropertyOptional({
    description: 'Material del producto',
    example: 'Plástico',
    type: String,
  })
  @IsOptional()
  material!: string | null;

  @ApiPropertyOptional({
    description: 'Peso del producto',
    example: '1 kg',
    type: String,
  })
  @IsOptional()
  peso!: string | null;

  @ApiPropertyOptional({
    description: 'Medida del producto',
    example: '10 x 20 x 30 cm',
    type: String,
  })
  @IsOptional()
  medida!: string | null;
}
