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
import { CreatePedidoDetalleUseCase } from '../../application/use-cases/create-pedido-detalle.use-case';
import { PedidoDetalle } from '../../domain/entity/pedido-detalle.entity';
import { CreatePedidoDetalleDTO } from '../../application/dto/create-pedido-detalle-dto';
import { GetPedidoDetalleByIdUseCase } from '../../application/use-cases/get-pedido-detalle-by-id.use-case';
import { GetAllPedidoDetalleUseCase } from '../../application/use-cases/get-all-pedido-detalle.use-case';
import { FiltersPedidoDetalleDTO } from '../../application/dto/filters-pedido-detalle-dto';
import { UpdatePedidoDetalleUseCase } from '../../application/use-cases/update-pedido-detalle.use-case';
import { DeletePedidoDetalleUseCase } from '../../application/use-cases/delete-pedido-detalle.use-case';
import { UpdatePedidoDetalleDTO } from '../../application/dto/update-pedido-detalle-dto';
import { CreatePedidoDetalleSwagger } from '../documentation/create-pedido-detalle.swagger';
import { GetAllPedidoDetalleSwagger } from '../documentation/get-all-pedido-detalle.swagger';
import { UpdatePedidoDetalleSwagger } from '../documentation/update-pedido-detalle.swagger';
import { DeletePedidoDetalleSwagger } from '../documentation/delete-pedido-detalle.swagger';
import { GetPedidoDetalleByIdSwagger } from '../documentation/get-pedido-detalle-by-id.swagger';

@ApiTags('Pedido Detalles')
@Controller('pedido-detalles')
export class PedidoDetalleController {
  constructor(
    private readonly createPedidoDetalleUseCase: CreatePedidoDetalleUseCase,
    private readonly getPedidoDetalleByIdUseCase: GetPedidoDetalleByIdUseCase,
    private readonly getAllPedidoDetalleUseCase: GetAllPedidoDetalleUseCase,
    private readonly updatePedidoDetalleUseCase: UpdatePedidoDetalleUseCase,
    private readonly deletePedidoDetalleUseCase: DeletePedidoDetalleUseCase,
  ) {}

  @Post()
  @CreatePedidoDetalleSwagger()
  async create(@Body() dto: CreatePedidoDetalleDTO): Promise<PedidoDetalle> {
    return this.createPedidoDetalleUseCase.ejecutar(dto);
  }

  @Get()
  @GetAllPedidoDetalleSwagger()
  async getAll(@Query() filters: FiltersPedidoDetalleDTO): Promise<{
    data: PedidoDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllPedidoDetalleUseCase.ejecutar(filters);
  }
  @Get(':id')
  @GetPedidoDetalleByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) pedidoDetalleId: number,
  ): Promise<PedidoDetalle> {
    const pedidoDetalle =
      await this.getPedidoDetalleByIdUseCase.ejecutar(pedidoDetalleId);
    if (!pedidoDetalle) {
      throw new NotFoundException('Detalle de pedido no encontrado');
    }
    return pedidoDetalle;
  }

  @Put(':id')
  @UpdatePedidoDetalleSwagger()
  async update(
    @Param('id', ParseIntPipe) pedidoDetalleId: number,
    @Body() dto: UpdatePedidoDetalleDTO,
  ): Promise<PedidoDetalle> {
    try {
      return await this.updatePedidoDetalleUseCase.ejecutar(
        pedidoDetalleId,
        dto,
      );
    } catch {
      throw new NotFoundException('Detalle de pedido no encontrado');
    }
  }

  @Delete(':id')
  @DeletePedidoDetalleSwagger()
  async delete(
    @Param('id', ParseIntPipe) pedidoDetalleId: number,
  ): Promise<{ success: boolean }> {
    const deleted =
      await this.deletePedidoDetalleUseCase.ejecutar(pedidoDetalleId);
    if (!deleted) {
      throw new NotFoundException('Detalle de pedido no encontrado');
    }
    return { success: true };
  }
}
