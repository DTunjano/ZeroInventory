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
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { Producto } from '../../domain/entity/producto.entity';
import { CreateProductDTO } from '../../application/dto/create-product-dto';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { GetAllProductosUseCase } from '../../application/use-cases/get-all-product.use-case';
import { FiltersProductDTO } from '../../application/dto/filters-product-dto';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { UpdateProductDTO } from '../../application/dto/update-product-dto';
import { CreateProductSwagger } from '../documentation/create-product.swagger';
import { GetAllProductSwagger } from '../documentation/get-all-product.swagger';
import { UpdateProductSwagger } from '../documentation/update-product.swagger';
import { DeleteProductSwagger } from '../documentation/delete-product.swagger';

@ApiTags('Productos')
@Controller('productos')
export class ProductoController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly getAllProductosUseCase: GetAllProductosUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @CreateProductSwagger()
  async create(@Body() body: CreateProductDTO): Promise<Producto> {
    const producto = await this.createProductUseCase.ejecutar(body);
    if (!producto) {
      throw new NotFoundException('No se pudo crear el producto');
    }
    return producto;
  }

  @Get()
  @GetAllProductSwagger()
  async getAll(@Query() filters?: FiltersProductDTO): Promise<Producto[]> {
    return this.getAllProductosUseCase.ejecutar(filters);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) productoId: number,
  ): Promise<Producto> {
    const producto = await this.getProductByIdUseCase.ejecutar(productoId);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  @Put(':id')
  @UpdateProductSwagger()
  async update(
    @Param('id', ParseIntPipe) productoId: number,
    @Body() body: UpdateProductDTO,
  ): Promise<Producto> {
    const producto = await this.updateProductUseCase.ejecutar(productoId, body);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  @Delete(':id')
  @DeleteProductSwagger()
  async remove(@Param('id', ParseIntPipe) productoId: number): Promise<void> {
    return this.deleteProductUseCase.ejecutar(productoId);
  }
}
