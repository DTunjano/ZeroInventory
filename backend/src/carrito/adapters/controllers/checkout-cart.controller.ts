import { Controller, Post, Req, Body, UseGuards, ConflictException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';
import { JwtAccessPayload } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { CheckoutCartDTO } from '../../application/dto/checkout-cart.dto';
import { CheckoutCartUseCase } from '../../application/use-cases/checkout-cart.use-case';

@ApiTags('Carrito')
@Controller('carritos')
export class CheckoutCartController {
  constructor(
    private readonly checkoutCartUseCase: CheckoutCartUseCase,
  ) {}

  @Post('me/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.CUSTOMER)
  async checkout(
    @Req() req: { user: JwtAccessPayload },
    @Body() body: CheckoutCartDTO,
  ): Promise<{ pedidoId: number; total: number; numeroPedidoUsuario: number }> {
    try {
      return await this.checkoutCartUseCase.ejecutar({
        usuarioId: req.user.sub,
        direccionId: body.direccionId,
        metodoPago: body.metodoPago,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        const response = error.getResponse();
        if (typeof response === 'object' && response !== null && 'error' in response) {
          throw new ConflictException(response);
        }
      }
      throw error;
    }
  }
}
