import { SetMetadata } from '@nestjs/common'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: RolNombreEnum[]) => SetMetadata(ROLES_KEY, roles)
