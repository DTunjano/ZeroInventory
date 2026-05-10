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
import { CreateCarritoUseCase } from '../../application/use-cases/create-carrito.use-case';
import { Carrito } from '../../domain/entity/carrito.entity';
import { CreateCarritoDTO } from '../../application/dto/create-carrito-dto';
import { GetCarritoByIdUseCase } from '../../application/use-cases/get-carrito-by-id.use-case';
import { GetAllCarritosUseCase } from '../../application/use-cases/get-all-carrito.use-case';
import { FiltersCarritoDTO } from '../../application/dto/filters-carrito-dto';
import { UpdateCarritoUseCase } from '../../application/use-cases/update-carrito.use-case';
import { DeleteCarritoUseCase } from '../../application/use-cases/delete-carrito.use-case';
import { UpdateCarritoDTO } from '../../application/dto/update-carrito-dto';
import { CreateCarritoSwagger } from '../documentation/create-carrito.swagger';
import { GetAllCarritosSwagger } from '../documentation/get-all-carrito.swagger';
import { UpdateCarritoSwagger } from '../documentation/update-carrito.swagger';
import { DeleteCarritoSwagger } from '../documentation/delete-carrito.swagger';
import { GetCarritoByIdSwagger } from '../documentation/get-carrito-by-id.swagger';

@ApiTags('Carritos')
@Controller('carritos')
export class CarritoController {
  constructor(
    private readonly createCarritoUseCase: CreateCarritoUseCase,
    private readonly getCarritoByIdUseCase: GetCarritoByIdUseCase,
    private readonly getAllCarritosUseCase: GetAllCarritosUseCase,
    private readonly updateCarritoUseCase: UpdateCarritoUseCase,
    private readonly deleteCarritoUseCase: DeleteCarritoUseCase,
  ) {}

  @Post()
  @CreateCarritoSwagger()
  async create(@Body() body: CreateCarritoDTO): Promise<Carrito> {
    const carrito = await this.createCarritoUseCase.ejecutar(body);
    if (!carrito) {
      throw new NotFoundException('No se pudo crear el carrito');
    }
    return carrito;
  }

  @Get()
  @GetAllCarritosSwagger()
  async getAll(@Query() filters?: FiltersCarritoDTO): Promise<{
    data: Carrito[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllCarritosUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetCarritoByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) carritoId: number,
  ): Promise<Carrito> {
    const carrito = await this.getCarritoByIdUseCase.ejecutar(carritoId);
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }
    return carrito;
  }

  @Put(':id')
  @UpdateCarritoSwagger()
  async update(
    @Param('id', ParseIntPipe) carritoId: number,
    @Body() body: UpdateCarritoDTO,
  ): Promise<Carrito> {
    const carrito = await this.updateCarritoUseCase.ejecutar(carritoId, body);
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }
    return carrito;
  }

  @Delete(':id')
  @DeleteCarritoSwagger()
  async remove(@Param('id', ParseIntPipe) carritoId: number): Promise<void> {
    return this.deleteCarritoUseCase.ejecutar(carritoId);
  }
}
