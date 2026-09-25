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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateProductoImagenUseCase } from '../../application/use-cases/create-producto-imagen.use-case';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';
import { CreateProductoImagenDTO } from '../../application/dto/create-producto-imagen-dto';
import { GetProductoImagenByIdUseCase } from '../../application/use-cases/get-producto-imagen-by-id.use-case';
import { GetAllProductoImagenUseCase } from '../../application/use-cases/get-all-producto-imagen.use-case';
import { FiltersProductoImagenDTO } from '../../application/dto/filters-producto-imagen-dto';
import { UpdateProductoImagenUseCase } from '../../application/use-cases/update-producto-imagen.use-case';
import { DeleteProductoImagenUseCase } from '../../application/use-cases/delete-producto-imagen.use-case';
import { CreateProductoImagenSwagger } from '../documentation/create-producto-imagen.swagger';
import { GetProductoImagenByIdSwagger } from '../documentation/get-producto-imagen-by-id.swagger';
import { GetAllProductoImagenSwagger } from '../documentation/get-all-producto-imagen.swagger';
import { UpdateProductoImagenSwagger } from '../documentation/update-producto-imagen.swagger';
import { DeleteProductoImagenSwagger } from '../documentation/delete-producto-imagen.swagger';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';

@ApiTags('Imágenes de Producto')
@Controller('producto-imagenes')
export class ProductoImagenController {
  constructor(
    private readonly createProductoImagenUseCase: CreateProductoImagenUseCase,
    private readonly getProductoImagenByIdUseCase: GetProductoImagenByIdUseCase,
    private readonly getAllProductoImagenUseCase: GetAllProductoImagenUseCase,
    private readonly updateProductoImagenUseCase: UpdateProductoImagenUseCase,
    private readonly deleteProductoImagenUseCase: DeleteProductoImagenUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiConsumes('multipart/form-data')
  @CreateProductoImagenSwagger()
  async create(
    @Body() body: CreateProductoImagenDTO,
    @UploadedFile() file: any,
  ): Promise<ProductoImagen> {
    const productoImagen = await this.createProductoImagenUseCase.ejecutar({
      productoId: body.productoId,
      url: file,
    });
    if (!productoImagen) {
      throw new NotFoundException('No se pudo crear la imagen de producto');
    }
    return productoImagen;
  }

  @Get()
  @GetAllProductoImagenSwagger()
  async getAll(@Query() filters?: FiltersProductoImagenDTO): Promise<{
    data: ProductoImagen[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllProductoImagenUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetProductoImagenByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) imagenProductoId: number,
  ): Promise<ProductoImagen> {
    const productoImagen =
      await this.getProductoImagenByIdUseCase.ejecutar(imagenProductoId);
    if (!productoImagen) {
      throw new NotFoundException('Imagen de producto no encontrada');
    }
    return productoImagen;
  }

  @Put(':id')
  @UpdateProductoImagenSwagger()
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id', ParseIntPipe) imagenProductoId: number,
    @UploadedFile() file: any,
  ): Promise<ProductoImagen> {
    const productoImagen = await this.updateProductoImagenUseCase.ejecutar(
      imagenProductoId,
      {
        url: file,
      },
    );
    if (!productoImagen) {
      throw new NotFoundException('Imagen de producto no encontrada');
    }
    return productoImagen;
  }

  @Delete(':id')
  @DeleteProductoImagenSwagger()
  async remove(
    @Param('id', ParseIntPipe) imagenProductoId: number,
  ): Promise<void> {
    return this.deleteProductoImagenUseCase.ejecutar(imagenProductoId);
  }
}
