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
import { CreateCarritoDetalleUseCase } from '../../application/use-cases/create-carrito-detalle.use-case';
import { CarritoDetalle } from '../../domain/entity/carrito-detalle.entity';
import { CreateCarritoDetalleDTO } from '../../application/dto/create-carrito-detalle-dto';
import { GetCarritoDetalleByIdUseCase } from '../../application/use-cases/get-carrito-detalle-by-id.use-case';
import { GetAllCarritoDetallesUseCase } from '../../application/use-cases/get-all-carrito-detalle.use-case';
import { FiltersCarritoDetalleDTO } from '../../application/dto/filters-carrito-detalle-dto';
import { UpdateCarritoDetalleUseCase } from '../../application/use-cases/update-carrito-detalle.use-case';
import { DeleteCarritoDetalleUseCase } from '../../application/use-cases/delete-carrito-detalle.use-case';
import { UpdateCarritoDetalleDTO } from '../../application/dto/update-carrito-detalle-dto';
import { CreateCarritoDetalleSwagger } from '../documentation/create-carrito-detalle.swagger';
import { GetAllCarritoDetallesSwagger } from '../documentation/get-all-carrito-detalle.swagger';
import { UpdateCarritoDetalleSwagger } from '../documentation/update-carrito-detalle.swagger';
import { DeleteCarritoDetalleSwagger } from '../documentation/delete-carrito-detalle.swagger';
import { GetCarritoDetalleByIdSwagger } from '../documentation/get-carrito-detalle-by-id.swagger';

@ApiTags('Carrito Detalles')
@Controller('carrito-detalles')
export class CarritoDetalleController {
  constructor(
    private readonly createCarritoDetalleUseCase: CreateCarritoDetalleUseCase,
    private readonly getCarritoDetalleByIdUseCase: GetCarritoDetalleByIdUseCase,
    private readonly getAllCarritoDetallesUseCase: GetAllCarritoDetallesUseCase,
    private readonly updateCarritoDetalleUseCase: UpdateCarritoDetalleUseCase,
    private readonly deleteCarritoDetalleUseCase: DeleteCarritoDetalleUseCase,
  ) {}

  @Post()
  @CreateCarritoDetalleSwagger()
  async create(@Body() body: CreateCarritoDetalleDTO): Promise<CarritoDetalle> {
    const carritoDetalle =
      await this.createCarritoDetalleUseCase.ejecutar(body);
    if (!carritoDetalle) {
      throw new NotFoundException('No se pudo crear el detalle de carrito');
    }
    return carritoDetalle;
  }

  @Get()
  @GetAllCarritoDetallesSwagger()
  async getAll(@Query() filters?: FiltersCarritoDetalleDTO): Promise<{
    data: CarritoDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllCarritoDetallesUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetCarritoDetalleByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) carritoDetalleId: number,
  ): Promise<CarritoDetalle> {
    const carritoDetalle =
      await this.getCarritoDetalleByIdUseCase.ejecutar(carritoDetalleId);
    if (!carritoDetalle) {
      throw new NotFoundException('Detalle de carrito no encontrado');
    }
    return carritoDetalle;
  }

  @Put(':id')
  @UpdateCarritoDetalleSwagger()
  async update(
    @Param('id', ParseIntPipe) carritoDetalleId: number,
    @Body() body: UpdateCarritoDetalleDTO,
  ): Promise<CarritoDetalle> {
    const carritoDetalle = await this.updateCarritoDetalleUseCase.ejecutar(
      carritoDetalleId,
      body,
    );
    if (!carritoDetalle) {
      throw new NotFoundException('Detalle de carrito no encontrado');
    }
    return carritoDetalle;
  }

  @Delete(':id')
  @DeleteCarritoDetalleSwagger()
  async remove(
    @Param('id', ParseIntPipe) carritoDetalleId: number,
  ): Promise<void> {
    return this.deleteCarritoDetalleUseCase.ejecutar(carritoDetalleId);
  }
}
