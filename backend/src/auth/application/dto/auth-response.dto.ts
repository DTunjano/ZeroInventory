import { ApiProperty } from '@nestjs/swagger'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'

export class AuthUserDTO {
  @ApiProperty({ example: 1 })
  usuarioId!: number

  @ApiProperty({ example: 'admin' })
  username!: string

  @ApiProperty({ isArray: true, enum: RolNombreEnum })
  roles!: RolNombreEnum[]
}

export class AuthResponseDTO {
  @ApiProperty({ description: 'JWT de acceso' })
  accessToken!: string

  @ApiProperty({ type: () => AuthUserDTO })
  user!: AuthUserDTO
}
