import {
  Controller,
  Delete,
  Get,
  GoneException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { GetAllPedidoDetalleUseCase } from '../../application/use-cases/get-all-pedido-detalle.use-case';
import { GetPedidoDetalleByIdUseCase } from '../../application/use-cases/get-pedido-detalle-by-id.use-case';
import { FiltersPedidoDetalleDTO } from '../../application/dto/filters-pedido-detalle-dto';
@ApiTags('Pedido Detalles')
@ApiBearerAuth()
@Roles('ADMIN', 'EMPLOYEE')
@Controller('pedido-detalles')
export class PedidoDetalleReadController {
  constructor(
    private readonly all: GetAllPedidoDetalleUseCase,
    private readonly byId: GetPedidoDetalleByIdUseCase,
  ) {}
  @Get() list(@Query() filters: FiltersPedidoDetalleDTO) {
    return this.all.ejecutar(filters);
  }
  @Get(':id') async get(@Param('id', ParseIntPipe) id: number) {
    const p = await this.byId.ejecutar(id);
    if (!p) throw new NotFoundException('Detalle no encontrado');
    return p;
  }
  @Post() create(): never {
    throw new GoneException('Las líneas se crean únicamente en el checkout');
  }
  @Put(':id') update(@Param('id', ParseIntPipe) _id: number): never {
    void _id;
    throw new GoneException('Las líneas del pedido son inmutables');
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) _id: number): never {
    void _id;
    throw new GoneException(
      'No se elimina historial de líneas; cancela o devuelve el pedido completo',
    );
  }
}
