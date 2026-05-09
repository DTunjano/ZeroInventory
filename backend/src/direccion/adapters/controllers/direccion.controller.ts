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
import { CreateDireccionUseCase } from '../../application/use-cases/create-direccion.use-case';
import { Direccion } from '../../domain/entity/direccion.entity';
import { CreateDireccionDTO } from '../../application/dto/create-direccion-dto';
import { GetDireccionByIdUseCase } from '../../application/use-cases/get-direccion-by-id.use-case';
import { GetAllDireccionesUseCase } from '../../application/use-cases/get-all-direccion.use-case';
import { FiltersDireccionDTO } from '../../application/dto/filters-direccion-dto';
import { UpdateDireccionUseCase } from '../../application/use-cases/update-direccion.use-case';
import { DeleteDireccionUseCase } from '../../application/use-cases/delete-direccion.use-case';
import { UpdateDireccionDTO } from '../../application/dto/update-direccion-dto';
import { CreateDireccionSwagger } from '../documentation/create-direccion.swagger';
import { GetAllDireccionSwagger } from '../documentation/get-all-direccion.swagger';
import { UpdateDireccionSwagger } from '../documentation/update-direccion.swagger';
import { DeleteDireccionSwagger } from '../documentation/delete-direccion.swagger';
import { GetDireccionByIdSwagger } from '../documentation/get-direccion-by-id.swagger';

@ApiTags('Direcciones')
@Controller('direcciones')
export class DireccionController {
  constructor(
    private readonly createDireccionUseCase: CreateDireccionUseCase,
    private readonly getDireccionByIdUseCase: GetDireccionByIdUseCase,
    private readonly getAllDireccionesUseCase: GetAllDireccionesUseCase,
    private readonly updateDireccionUseCase: UpdateDireccionUseCase,
    private readonly deleteDireccionUseCase: DeleteDireccionUseCase,
  ) {}

  @Post()
  @CreateDireccionSwagger()
  async create(@Body() body: CreateDireccionDTO): Promise<Direccion> {
    const direccion = await this.createDireccionUseCase.ejecutar(body);
    if (!direccion) {
      throw new NotFoundException('No se pudo crear la dirección');
    }
    return direccion;
  }

  @Get()
  @GetAllDireccionSwagger()
  async getAll(@Query() filters?: FiltersDireccionDTO): Promise<{
    data: Direccion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllDireccionesUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetDireccionByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) direccionId: number,
  ): Promise<Direccion> {
    const direccion = await this.getDireccionByIdUseCase.ejecutar(direccionId);
    if (!direccion) {
      throw new NotFoundException('Dirección no encontrada');
    }
    return direccion;
  }

  @Put(':id')
  @UpdateDireccionSwagger()
  async update(
    @Param('id', ParseIntPipe) direccionId: number,
    @Body() body: UpdateDireccionDTO,
  ): Promise<Direccion> {
    const direccion = await this.updateDireccionUseCase.ejecutar(
      direccionId,
      body,
    );
    if (!direccion) {
      throw new NotFoundException('Dirección no encontrada');
    }
    return direccion;
  }

  @Delete(':id')
  @DeleteDireccionSwagger()
  async remove(@Param('id', ParseIntPipe) direccionId: number): Promise<void> {
    return this.deleteDireccionUseCase.ejecutar(direccionId);
  }
}
