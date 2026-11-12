import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsNumber, Max, Min } from 'class-validator';

export class CreateProductDTO {
  @ApiProperty({
    description: 'ID del proveedor del producto',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  @IsInt({ message: 'El proveedor debe ser un entero' })
  @Min(1, { message: 'El proveedor debe ser válido' })
  proveedorId!: number;

  @ApiProperty({ type: [Number], description: 'Al menos una categoría existente' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Selecciona al menos una categoría' })
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoriaIds!: number[];

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
    @IsInt()
  @Max(2147483647)
  cantidad!: number;

  @ApiProperty({
    description: 'Precio del producto',
    example: 193000,
    type: Number,
  })
  @IsNotEmpty({ message: 'El precio del producto es obligatorio' })
  @Min(0.01, { message: 'El precio del producto debe ser mayor que cero' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Max(999999999999.99)
  precio!: number;

  @ApiPropertyOptional({
    description: 'Descripción del producto',
    example: 'Shaker de plástico resistente',
    type: String,
  })
  @IsOptional()
  descripcion?: string | null;

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Brand Name',
    type: String,
  })
  @IsOptional()
  marca?: string | null;

  @ApiPropertyOptional({
    description: 'Material del producto',
    example: 'Plástico',
    type: String,
  })
  @IsOptional()
  material?: string | null;

  @ApiPropertyOptional({
    description: 'Peso del producto',
    example: '1 kg',
    type: String,
  })
  @IsOptional()
  peso?: string | null;

  @ApiPropertyOptional({
    description: 'Medida del producto',
    example: '10 x 20 x 30 cm',
    type: String,
  })
  @IsOptional()
  medida?: string | null;
}
