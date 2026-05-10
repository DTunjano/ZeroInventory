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
import { CreateCompraUseCase } from '../../application/use-cases/create-compra.use-case';
import { Compra } from '../../domain/entity/compra.entity';
import { CreateCompraDTO } from '../../application/dto/create-compra-dto';
import { GetCompraByIdUseCase } from '../../application/use-cases/get-compra-by-id.use-case';
import { GetAllComprasUseCase } from '../../application/use-cases/get-all-compra.use-case';
import { FilterCompraDTO } from '../../application/dto/filters-compra-dto';
import { UpdateCompraUseCase } from '../../application/use-cases/update-compra.use-case';
import { DeleteCompraUseCase } from '../../application/use-cases/delete-compra.use-case';
import { UpdateCompraDTO } from '../../application/dto/update-compra-dto';
import { CreateCompraSwagger } from '../documentation/create-compra.swagger';
import { GetAllComprasSwagger } from '../documentation/get-all-compra.swagger';
import { GetCompraByIdSwagger } from '../documentation/get-compra-by-id.swagger';
import { UpdateCompraSwagger } from '../documentation/update-compra.swagger';
import { DeleteCompraSwagger } from '../documentation/delete-compra.swagger';

@ApiTags('Compras')
@Controller('compras')
export class CompraController {
  constructor(
    private readonly createCompraUseCase: CreateCompraUseCase,
    private readonly getCompraByIdUseCase: GetCompraByIdUseCase,
    private readonly getAllComprasUseCase: GetAllComprasUseCase,
    private readonly updateCompraUseCase: UpdateCompraUseCase,
    private readonly deleteCompraUseCase: DeleteCompraUseCase,
  ) {}

  @Post()
  @CreateCompraSwagger()
  async create(@Body() body: CreateCompraDTO): Promise<Compra> {
    const compra = await this.createCompraUseCase.ejecutar(body);
    if (!compra) {
      throw new NotFoundException('No se pudo crear la compra');
    }
    return compra;
  }

  @Get()
  @GetAllComprasSwagger()
  async getAll(@Query() filters?: FilterCompraDTO): Promise<{
    data: Compra[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllComprasUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetCompraByIdSwagger()
  async getById(@Param('id', ParseIntPipe) compraId: number): Promise<Compra> {
    const compra = await this.getCompraByIdUseCase.ejecutar(compraId);
    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }
    return compra;
  }

  @Put(':id')
  @UpdateCompraSwagger()
  async update(
    @Param('id', ParseIntPipe) compraId: number,
    @Body() body: UpdateCompraDTO,
  ): Promise<Compra> {
    const compra = await this.updateCompraUseCase.ejecutar(compraId, body);
    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }
    return compra;
  }

  @Delete(':id')
  @DeleteCompraSwagger()
  async remove(@Param('id', ParseIntPipe) compraId: number): Promise<void> {
    return this.deleteCompraUseCase.ejecutar(compraId);
  }
}
