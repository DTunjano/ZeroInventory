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
import { CreateAjusteInventarioUseCase } from '../../application/use-cases/create-ajuste-inventario.use-case';
import { AjusteInventario } from '../../domain/entity/ajuste-inventario.entity';
import { CreateAjusteInventarioDTO } from '../../application/dto/create-ajuste-inventario-dto';
import { GetAjusteInventarioByIdUseCase } from '../../application/use-cases/get-ajuste-inventario-by-id.use-case';
import { GetAllAjustesInventarioUseCase } from '../../application/use-cases/get-all-ajuste-inventario.use-case';
import { FilterAjusteInventarioDTO } from '../../application/dto/filters-ajuste-inventario-dto';
import { UpdateAjusteInventarioUseCase } from '../../application/use-cases/update-ajuste-inventario.use-case';
import { DeleteAjusteInventarioUseCase } from '../../application/use-cases/delete-ajuste-inventario.use-case';
import { UpdateAjusteInventarioDTO } from '../../application/dto/update-ajuste-inventario-dto';
import { CreateAjusteInventarioSwagger } from '../documentation/create-ajuste-inventario.swagger';
import { GetAllAjustesInventarioSwagger } from '../documentation/get-all-ajuste-inventario.swagger';
import { GetAjusteInventarioByIdSwagger } from '../documentation/get-ajuste-inventario-by-id.swagger';
import { UpdateAjusteInventarioSwagger } from '../documentation/update-ajuste-inventario.swagger';
import { DeleteAjusteInventarioSwagger } from '../documentation/delete-ajuste-inventario.swagger';

@ApiTags('Ajustes Inventario')
@Controller('ajustes-inventario')
export class AjusteInventarioController {
  constructor(
    private readonly createAjusteInventarioUseCase: CreateAjusteInventarioUseCase,
    private readonly getAjusteInventarioByIdUseCase: GetAjusteInventarioByIdUseCase,
    private readonly getAllAjustesInventarioUseCase: GetAllAjustesInventarioUseCase,
    private readonly updateAjusteInventarioUseCase: UpdateAjusteInventarioUseCase,
    private readonly deleteAjusteInventarioUseCase: DeleteAjusteInventarioUseCase,
  ) {}

  @Post()
  @CreateAjusteInventarioSwagger()
  async create(
    @Body() body: CreateAjusteInventarioDTO,
  ): Promise<AjusteInventario> {
    const ajuste = await this.createAjusteInventarioUseCase.ejecutar(body);
    if (!ajuste) {
      throw new NotFoundException('No se pudo crear el ajuste de inventario');
    }
    return ajuste;
  }

  @Get()
  @GetAllAjustesInventarioSwagger()
  async getAll(@Query() filters?: FilterAjusteInventarioDTO): Promise<{
    data: AjusteInventario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllAjustesInventarioUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetAjusteInventarioByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) ajusteInventarioId: number,
  ): Promise<AjusteInventario> {
    const ajuste =
      await this.getAjusteInventarioByIdUseCase.ejecutar(ajusteInventarioId);
    if (!ajuste) {
      throw new NotFoundException('Ajuste de inventario no encontrado');
    }
    return ajuste;
  }

  @Put(':id')
  @UpdateAjusteInventarioSwagger()
  async update(
    @Param('id', ParseIntPipe) ajusteInventarioId: number,
    @Body() body: UpdateAjusteInventarioDTO,
  ): Promise<AjusteInventario> {
    const ajuste = await this.updateAjusteInventarioUseCase.ejecutar(
      ajusteInventarioId,
      body,
    );
    if (!ajuste) {
      throw new NotFoundException('Ajuste de inventario no encontrado');
    }
    return ajuste;
  }

  @Delete(':id')
  @DeleteAjusteInventarioSwagger()
  async remove(
    @Param('id', ParseIntPipe) ajusteInventarioId: number,
  ): Promise<void> {
    return this.deleteAjusteInventarioUseCase.ejecutar(ajusteInventarioId);
  }
}
