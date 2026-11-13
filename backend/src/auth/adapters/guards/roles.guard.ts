import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY } from '../decorators/roles.decorator'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'

type RequestUser = {
  roles?: RolNombreEnum[]
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolNombreEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles || requiredRoles.length === 0) return true

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>()
    const roles = request.user?.roles ?? []

    const allowed = requiredRoles.some((r) => roles.includes(r))
    if (!allowed) {
      throw new ForbiddenException('No tienes permisos para esta acción')
    }

    return true
  }
}
