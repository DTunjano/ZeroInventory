import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'

/**
 * Decorador para extraer usuarioId del JWT
 * Uso: @CurrentUser() usuarioId: number
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): number => {
  const request = ctx.switchToHttp().getRequest()
  const userId = request.user?.usuarioId ?? request.user?.sub ?? request.user?.id

  if (typeof userId !== 'number' || !Number.isInteger(userId) || userId <= 0) {
    throw new UnauthorizedException('No se pudo resolver el usuario autenticado')
  }

  return userId
})
