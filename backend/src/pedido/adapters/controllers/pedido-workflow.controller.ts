import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import type { JwtAccessPayload } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { PedidoWorkflowUseCase } from '../../application/pedido-workflow.use-case';
import { PedidoCommandDTO } from '../../application/dto/pedido-command.dto';
import { FiltersPedidoDTO } from '../../application/dto/filters-pedido-dto';
import { FiltersMyOrdersDTO } from '../../application/dto/filters-my-orders.dto';
@ApiTags('Pedidos')
@ApiBearerAuth()
@Controller('pedidos')
@Roles('ADMIN', 'EMPLOYEE')
export class PedidoWorkflowController {
  constructor(private readonly workflow: PedidoWorkflowUseCase) {}
  @Get('me')
  @Roles('CUSTOMER')
  own(
    @Req() req: { user: JwtAccessPayload },
    @Query() filters: FiltersMyOrdersDTO,
  ) {
    return this.workflow.own(req.user.sub, filters);
  }
  @Get('me/:id')
  @Roles('CUSTOMER')
  ownDetail(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: JwtAccessPayload },
  ) {
    return this.workflow.get(id, req.user.sub);
  }
  @Post('me/:id/cancel')
  @HttpCode(200)
  @Roles('CUSTOMER')
  cancelOwn(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PedidoCommandDTO,
    @Req() req: { user: JwtAccessPayload },
  ) {
    return this.workflow.execute(
      id,
      'CANCELAR',
      body,
      req.user.sub,
      req.user.roles,
      true,
    );
  }
  @Get() list(@Query() filters: FiltersPedidoDTO) {
    return this.workflow.list(filters);
  }
  @Get(':id') get(@Param('id', ParseIntPipe) id: number) {
    return this.workflow.get(id);
  }
  @Post(':id/actions/:action')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Operar pedido con versión, motivo y actor de sesión; acciones financieras solo ADMIN',
  })
  execute(
    @Param('id', ParseIntPipe) id: number,
    @Param('action') action: string,
    @Body() body: PedidoCommandDTO,
    @Req() req: { user: JwtAccessPayload },
  ) {
    return this.workflow.execute(
      id,
      action,
      body,
      req.user.sub,
      req.user.roles,
    );
  }
  @Post()
  @ApiOperation({
    summary: 'Retirado: crear pedidos mediante checkout',
    deprecated: true,
  })
  create(): never {
    throw new GoneException(
      'Crea el pedido mediante checkout con líneas, pago e inventario atómicos',
    );
  }
  @Put(':id') update(@Param('id', ParseIntPipe) _id: number): never {
    void _id;
    throw new GoneException(
      'Usa las acciones con versión; no se editan líneas, total ni cabecera por separado',
    );
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) _id: number): never {
    void _id;
    throw new GoneException(
      'Cancela o devuelve con motivo; no se borra el pedido',
    );
  }
}
