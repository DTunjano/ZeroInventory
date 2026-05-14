import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProveedorUseCase } from '../../application/use-cases/create-proveedor.use-case';
import { Proveedor } from '../../domain/entity/proveedor.entity';
import { CreateProveedorDTO } from '../../application/dto/create-proveedor-dto';
import { GetProveedorByIdUseCase } from '../../application/use-cases/get-proveedor-by-id.use-case';
import { GetAllProveedoresUseCase } from '../../application/use-cases/get-all-proveedor.use-case';
import { FilterProveedorDTO } from '../../application/dto/filters-proveedor-dto';
import { UpdateProveedorUseCase } from '../../application/use-cases/update-proveedor.use-case';
import { DeleteProveedorUseCase } from '../../application/use-cases/delete-proveedor.use-case';
import { UpdateProveedorDTO } from '../../application/dto/update-proveedor-dto';
import { ToggleProveedorUseCase } from '../../application/use-cases/toggle-proveedor.use-case';
import { GetSuppliedProductCountUseCase } from '../../application/use-cases/get-supplied-product-count.use-case';
import { CreateProveedorSwagger } from '../documentation/create-proveedor.swagger';
import { GetAllProveedoresSwagger } from '../documentation/get-all-proveedor.swagger';
import { GetProveedorByIdSwagger } from '../documentation/get-proveedor-by-id.swagger';
import { UpdateProveedorSwagger } from '../documentation/update-proveedor.swagger';
import { DeleteProveedorSwagger } from '../documentation/delete-proveedor.swagger';

@ApiTags('Proveedores')
@Controller('proveedores')
export class ProveedorController {
  constructor(
    private readonly createProveedorUseCase: CreateProveedorUseCase,
    private readonly getProveedorByIdUseCase: GetProveedorByIdUseCase,
    private readonly getAllProveedoresUseCase: GetAllProveedoresUseCase,
    private readonly updateProveedorUseCase: UpdateProveedorUseCase,
    private readonly deleteProveedorUseCase: DeleteProveedorUseCase,
    private readonly toggleProveedorUseCase: ToggleProveedorUseCase,
    private readonly getSuppliedProductCountUseCase: GetSuppliedProductCountUseCase,
  ) {}

  @Post()
  @CreateProveedorSwagger()
  async create(@Body() body: CreateProveedorDTO): Promise<Proveedor> {
    const proveedor = await this.createProveedorUseCase.ejecutar(body);
    if (!proveedor) {
      throw new NotFoundException('No se pudo crear el proveedor');
    }
    return proveedor;
  }

  @Get()
  @GetAllProveedoresSwagger()
  async getAll(@Query() filters?: FilterProveedorDTO): Promise<{
    data: Proveedor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllProveedoresUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetProveedorByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) proveedorId: number,
  ): Promise<Proveedor> {
    const proveedor = await this.getProveedorByIdUseCase.ejecutar(proveedorId);
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return proveedor;
  }

  @Put(':id')
  @UpdateProveedorSwagger()
  async update(
    @Param('id', ParseIntPipe) proveedorId: number,
    @Body() body: UpdateProveedorDTO,
  ): Promise<Proveedor> {
    const proveedor = await this.updateProveedorUseCase.ejecutar(
      proveedorId,
      body,
    );
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return proveedor;
  }

  @Patch(':id/estado')
  async toggleStatus(
    @Param('id', ParseIntPipe) proveedorId: number,
  ): Promise<Proveedor> {
    const proveedor = await this.toggleProveedorUseCase.ejecutar(proveedorId);
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return proveedor;
  }

  @Get(':id/productos-suministrados')
  async getSuppliedProductCount(
    @Param('id', ParseIntPipe) proveedorId: number,
  ): Promise<{ total: number }> {
    const total = await this.getSuppliedProductCountUseCase.ejecutar(proveedorId);
    return { total };
  }

  @Delete(':id')
  @DeleteProveedorSwagger()
  async remove(@Param('id', ParseIntPipe) proveedorId: number): Promise<void> {
    return this.deleteProveedorUseCase.ejecutar(proveedorId);
  }
}
