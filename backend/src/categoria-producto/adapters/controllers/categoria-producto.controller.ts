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
import { CreateCategoriaProductoUseCase } from '../../application/use-cases/create-categoria-producto.use-case';
import { CategoriaProducto } from '../../domain/entity/categoria-producto.entity';
import { CreateCategoriaProductoDTO } from '../../application/dto/create-categoria-producto-dto';
import { GetCategoriaProductoByIdUseCase } from '../../application/use-cases/get-categoria-producto-by-id.use-case';
import { GetAllCategoriaProductosUseCase } from '../../application/use-cases/get-all-categoria-producto.use-case';
import { FiltersCategoriaProductoDTO } from '../../application/dto/filters-categoria-producto-dto';
import { UpdateCategoriaProductoUseCase } from '../../application/use-cases/update-categoria-producto.use-case';
import { DeleteCategoriaProductoUseCase } from '../../application/use-cases/delete-categoria-producto.use-case';
import { UpdateCategoriaProductoDTO } from '../../application/dto/update-categoria-producto-dto';
import { CreateCategoriaProductoSwagger } from '../documentation/create-categoria-producto.swagger';
import { GetAllCategoriaProductoSwagger } from '../documentation/get-all-categoria-producto.swagger';
import { UpdateCategoriaProductoSwagger } from '../documentation/update-categoria-producto.swagger';
import { DeleteCategoriaProductoSwagger } from '../documentation/delete-categoria-producto.swagger';
import { GetCategoriaProductoByIdSwagger } from '../documentation/get-categoria-producto-by-id.swagger';

@ApiTags('Categoría-Producto')
@Controller('categoria-productos')
export class CategoriaProductoController {
  constructor(
    private readonly createCategoriaProductoUseCase: CreateCategoriaProductoUseCase,
    private readonly getCategoriaProductoByIdUseCase: GetCategoriaProductoByIdUseCase,
    private readonly getAllCategoriaProductosUseCase: GetAllCategoriaProductosUseCase,
    private readonly updateCategoriaProductoUseCase: UpdateCategoriaProductoUseCase,
    private readonly deleteCategoriaProductoUseCase: DeleteCategoriaProductoUseCase,
  ) {}

  @Post()
  @CreateCategoriaProductoSwagger()
  async create(
    @Body() body: CreateCategoriaProductoDTO,
  ): Promise<CategoriaProducto> {
    const categoriaProducto =
      await this.createCategoriaProductoUseCase.ejecutar(body);
    if (!categoriaProducto) {
      throw new NotFoundException('No se pudo crear la relación');
    }
    return categoriaProducto;
  }

  @Get()
  @GetAllCategoriaProductoSwagger()
  async getAll(@Query() filters?: FiltersCategoriaProductoDTO): Promise<{
    data: CategoriaProducto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllCategoriaProductosUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetCategoriaProductoByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) categoriaProductoId: number,
  ): Promise<CategoriaProducto> {
    const categoriaProducto =
      await this.getCategoriaProductoByIdUseCase.ejecutar(categoriaProductoId);
    if (!categoriaProducto) {
      throw new NotFoundException('Relación no encontrada');
    }
    return categoriaProducto;
  }

  @Put(':id')
  @UpdateCategoriaProductoSwagger()
  async update(
    @Param('id', ParseIntPipe) categoriaProductoId: number,
    @Body() body: UpdateCategoriaProductoDTO,
  ): Promise<CategoriaProducto> {
    const categoriaProducto =
      await this.updateCategoriaProductoUseCase.ejecutar(
        categoriaProductoId,
        body,
      );
    if (!categoriaProducto) {
      throw new NotFoundException('Relación no encontrada');
    }
    return categoriaProducto;
  }

  @Delete(':id')
  @DeleteCategoriaProductoSwagger()
  async remove(
    @Param('id', ParseIntPipe) categoriaProductoId: number,
  ): Promise<void> {
    return this.deleteCategoriaProductoUseCase.ejecutar(categoriaProductoId);
  }
}
