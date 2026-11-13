import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateMyDireccionDTO {
  @ApiProperty({
    description: 'Línea de dirección',
    example: 'Calle 10 No. 20-30',
    type: String,
  })
  @IsNotEmpty({ message: 'La línea de dirección es obligatoria' })
  @Transform(({ value }: { value: string }) => value.trim())
  lineaDir!: string

  @ApiProperty({
    description: 'Barrio',
    example: 'Centro',
    type: String,
  })
  @IsNotEmpty({ message: 'El barrio es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  barrio!: string

  @ApiPropertyOptional({
    description: 'Código postal',
    example: '080001',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => (typeof value === 'string' ? value.trim() : value))
  codigoPostal?: string | null

  @ApiPropertyOptional({
    description: 'Indica si es la dirección predeterminada',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  esPredeterminada?: boolean

  @ApiPropertyOptional({
    description: 'Información adicional',
    example: 'Apartamento 305',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => (typeof value === 'string' ? value.trim() : value))
  infoAdiccional?: string | null
}