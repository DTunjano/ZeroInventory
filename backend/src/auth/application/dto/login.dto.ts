import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, MinLength } from 'class-validator'

export class LoginDTO {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'admin',
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
}
