import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'

export type AuthUser = {
  usuarioId: number
  username: string
  passwordHash: string
  isActive: boolean
  roles: RolNombreEnum[]
}
