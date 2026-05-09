import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePedidoUseCase } from '../../application/use-cases/create-pedido.use-case';
import { Pedido } from '../../domain/entity/pedido.entity';
import { CreatePedidoDTO } from '../../application/dto/create-pedido-dto';
import { GetPedidoByIdUseCase } from '../../application/use-cases/get-pedido-by-id.use-case';
import { GetAllPedidosUseCase } from '../../application/use-cases/get-all-pedido.use-case';
import { FiltersPedidoDTO } from '../../application/dto/filters-pedido-dto';
import { UpdatePedidoUseCase } from '../../application/use-cases/update-pedido.use-case';
import { DeletePedidoUseCase } from '../../application/use-cases/delete-pedido.use-case';
import { UpdatePedidoDTO } from '../../application/dto/update-pedido-dto';
import { CreatePedidoSwagger } from '../documentation/create-pedido.swagger';
import { GetAllPedidoSwagger } from '../documentation/get-all-pedido.swagger';
import { UpdatePedidoSwagger } from '../documentation/update-pedido.swagger';
import { DeletePedidoSwagger } from '../documentation/delete-pedido.swagger';
import { GetPedidoByIdSwagger } from '../documentation/get-pedido-by-id.swagger';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidoController {
  constructor(
    private readonly createPedidoUseCase: CreatePedidoUseCase,
    private readonly getPedidoByIdUseCase: GetPedidoByIdUseCase,
    private readonly getAllPedidosUseCase: GetAllPedidosUseCase,
    private readonly updatePedidoUseCase: UpdatePedidoUseCase,
    private readonly deletePedidoUseCase: DeletePedidoUseCase,
  ) {}

  @Post()
  @CreatePedidoSwagger()
  async create(@Body() body: CreatePedidoDTO): Promise<Pedido> {
    const pedido = await this.createPedidoUseCase.ejecutar(body);
    if (!pedido) {
      throw new NotFoundException('No se pudo crear el pedido');
    }
    return pedido;
  }

  @Get()
  @GetAllPedidoSwagger()
  async getAll(@Query() filters?: FiltersPedidoDTO): Promise<{
    data: Pedido[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllPedidosUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetPedidoByIdSwagger()
  async getById(@Param('id', ParseIntPipe) pedidoId: number): Promise<Pedido> {
    const pedido = await this.getPedidoByIdUseCase.ejecutar(pedidoId);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  @Put(':id')
  @UpdatePedidoSwagger()
  async update(
    @Param('id', ParseIntPipe) pedidoId: number,
    @Body() body: UpdatePedidoDTO,
  ): Promise<Pedido> {
    const pedido = await this.updatePedidoUseCase.ejecutar(pedidoId, body);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  @Delete(':id')
  @DeletePedidoSwagger()
  async remove(@Param('id', ParseIntPipe) pedidoId: number): Promise<void> {
    return this.deletePedidoUseCase.ejecutar(pedidoId);
  }
}
