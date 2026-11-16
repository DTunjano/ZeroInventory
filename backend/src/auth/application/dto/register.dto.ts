import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator'

import { TipoDocumentoEnum } from '../../../cliente/domain/entity/cliente.entity'

export class RegisterDTO {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'cliente@correo.com',
    type: String,
  })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  username!: string

  @ApiProperty({
    description: 'Contraseña',
    example: 'SecurePassword123!',
    type: String,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password!: string

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TipoDocumentoEnum,
    example: TipoDocumentoEnum.CC,
  })
  @IsOptional()
  @IsEnum(TipoDocumentoEnum, {
    message: 'El tipo de documento debe ser CC, CE o PASAPORTE',
  })
  tipoDocumento?: TipoDocumentoEnum

  @ApiProperty({
    description: 'Número de documento',
    example: '1234567890',
    type: String,
  })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Transform(({ value }: { value: string }) => value.trim())
  documento!: string

  @ApiPropertyOptional({ example: 'Juan', type: String })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value.trim())
  primerNombre?: string

  @ApiPropertyOptional({ example: 'Pérez', type: String })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value.trim())
  primerApellido?: string
}