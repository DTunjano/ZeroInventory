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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/adapters/decorators/public.decorator';
import { CreateCategoriaUseCase } from '../../application/use-cases/create-categoria.use-case';
import { Categoria } from '../../domain/entity/categoria.entity';
import { CreateCategoriaDTO } from '../../application/dto/create-categoria-dto';
import { GetCategoriaByIdUseCase } from '../../application/use-cases/get-categoria-by-id.use-case';
import { GetAllCategoriasUseCase } from '../../application/use-cases/get-all-categoria.use-case';
import { FiltersCategoriaDTO } from '../../application/dto/filters-categoria-dto';
import { UpdateCategoriaUseCase } from '../../application/use-cases/update-categoria.use-case';
import { DeleteCategoriaUseCase } from '../../application/use-cases/delete-categoria.use-case';
import { UpdateCategoriaDTO } from '../../application/dto/update-categoria-dto';
import { CreateCategoriaSwagger } from '../documentation/create-categoria.swagger';
import { GetAllCategoriaSwagger } from '../documentation/get-all-categoria.swagger';
import { UpdateCategoriaSwagger } from '../documentation/update-categoria.swagger';
import { DeleteCategoriaSwagger } from '../documentation/delete-categoria.swagger';
import { GetCategoriaByIdSwagger } from '../documentation/get-categoria-by-id.swagger';
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

@ApiTags('Categorías')
@Controller('categorias')
export class CategoriaController {
  constructor(
    private readonly createCategoriaUseCase: CreateCategoriaUseCase,
    private readonly getCategoriaByIdUseCase: GetCategoriaByIdUseCase,
    private readonly getAllCategoriasUseCase: GetAllCategoriasUseCase,
    private readonly updateCategoriaUseCase: UpdateCategoriaUseCase,
    private readonly deleteCategoriaUseCase: DeleteCategoriaUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @CreateCategoriaSwagger()
  async create(@Body() body: CreateCategoriaDTO): Promise<Categoria> {
    const categoria = await this.createCategoriaUseCase.ejecutar(body);
    if (!categoria) {
      throw new NotFoundException('No se pudo crear la categoría');
    }
    return categoria;
  }

  @Get()
  @Public()
  @GetAllCategoriaSwagger()
  async getAll(@Query() filters?: FiltersCategoriaDTO): Promise<{
    data: Categoria[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllCategoriasUseCase.ejecutar(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @GetCategoriaByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) categoriaId: number,
  ): Promise<Categoria> {
    const categoria = await this.getCategoriaByIdUseCase.ejecutar(categoriaId);
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @UpdateCategoriaSwagger()
  async update(
    @Param('id', ParseIntPipe) categoriaId: number,
    @Body() body: UpdateCategoriaDTO,
  ): Promise<Categoria> {
    const categoria = await this.updateCategoriaUseCase.ejecutar(
      categoriaId,
      body,
    );
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN)
  @DeleteCategoriaSwagger()
  async remove(@Param('id', ParseIntPipe) categoriaId: number): Promise<void> {
    return this.deleteCategoriaUseCase.ejecutar(categoriaId);
  }
}
