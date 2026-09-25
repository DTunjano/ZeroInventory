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
import { CreateCompraDetalleUseCase } from '../../application/use-cases/create-compra-detalle.use-case';
import { CompraDetalle } from '../../domain/entity/compra-detalle.entity';
import { CreateCompraDetalleDTO } from '../../application/dto/create-compra-detalle-dto';
import { GetCompraDetalleByIdUseCase } from '../../application/use-cases/get-compra-detalle-by-id.use-case';
import { GetAllCompraDetallesUseCase } from '../../application/use-cases/get-all-compra-detalle.use-case';
import { FilterCompraDetalleDTO } from '../../application/dto/filters-compra-detalle-dto';
import { UpdateCompraDetalleUseCase } from '../../application/use-cases/update-compra-detalle.use-case';
import { DeleteCompraDetalleUseCase } from '../../application/use-cases/delete-compra-detalle.use-case';
import { UpdateCompraDetalleDTO } from '../../application/dto/update-compra-detalle-dto';
import { CreateCompraDetalleSwagger } from '../documentation/create-compra-detalle.swagger';
import { GetAllCompraDetallesSwagger } from '../documentation/get-all-compra-detalle.swagger';
import { GetCompraDetalleByIdSwagger } from '../documentation/get-compra-detalle-by-id.swagger';
import { UpdateCompraDetalleSwagger } from '../documentation/update-compra-detalle.swagger';
import { DeleteCompraDetalleSwagger } from '../documentation/delete-compra-detalle.swagger';

@ApiTags('Compra Detalles')
@Controller('compra-detalles')
export class CompraDetalleController {
  constructor(
    private readonly createCompraDetalleUseCase: CreateCompraDetalleUseCase,
    private readonly getCompraDetalleByIdUseCase: GetCompraDetalleByIdUseCase,
    private readonly getAllCompraDetallesUseCase: GetAllCompraDetallesUseCase,
    private readonly updateCompraDetalleUseCase: UpdateCompraDetalleUseCase,
    private readonly deleteCompraDetalleUseCase: DeleteCompraDetalleUseCase,
  ) {}

  @Post()
  @CreateCompraDetalleSwagger()
  async create(@Body() body: CreateCompraDetalleDTO): Promise<CompraDetalle> {
    const compraDetalle = await this.createCompraDetalleUseCase.ejecutar(body);
    if (!compraDetalle) {
      throw new NotFoundException('No se pudo crear el detalle de compra');
    }
    return compraDetalle;
  }

  @Get()
  @GetAllCompraDetallesSwagger()
  async getAll(@Query() filters?: FilterCompraDetalleDTO): Promise<{
    data: CompraDetalle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllCompraDetallesUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetCompraDetalleByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) compraDetalleId: number,
  ): Promise<CompraDetalle> {
    const compraDetalle =
      await this.getCompraDetalleByIdUseCase.ejecutar(compraDetalleId);
    if (!compraDetalle) {
      throw new NotFoundException('Detalle de compra no encontrado');
    }
    return compraDetalle;
  }

  @Put(':id')
  @UpdateCompraDetalleSwagger()
  async update(
    @Param('id', ParseIntPipe) compraDetalleId: number,
    @Body() body: UpdateCompraDetalleDTO,
  ): Promise<CompraDetalle> {
    const compraDetalle = await this.updateCompraDetalleUseCase.ejecutar(
      compraDetalleId,
      body,
    );
    if (!compraDetalle) {
      throw new NotFoundException('Detalle de compra no encontrado');
    }
    return compraDetalle;
  }

  @Delete(':id')
  @DeleteCompraDetalleSwagger()
  async remove(
    @Param('id', ParseIntPipe) compraDetalleId: number,
  ): Promise<void> {
    return this.deleteCompraDetalleUseCase.ejecutar(compraDetalleId);
  }
}
