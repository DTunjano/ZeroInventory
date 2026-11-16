import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class ApiAccessGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) { super(); }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;
    await super.canActivate(context);
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, targets) ?? ['ADMIN', 'EMPLOYEE'];
    const user = context.switchToHttp().getRequest<{ user: { roles: string[] } }>().user;
    if (!roles.some((role) => user.roles.includes(role))) throw new ForbiddenException('No tienes permisos para esta acción');
    return true;
  }
}
