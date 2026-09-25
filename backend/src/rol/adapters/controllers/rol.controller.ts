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
import { CreateRolUseCase } from '../../application/use-cases/create-rol.use-case';
import { Rol } from '../../domain/entity/rol.entity';
import { CreateRolDTO } from '../../application/dto/create-rol-dto';
import { GetRolByIdUseCase } from '../../application/use-cases/get-rol-by-id.use-case';
import { GetAllRolUseCase } from '../../application/use-cases/get-all-rol.use-case';
import { FiltersRolDTO } from '../../application/dto/filters-rol-dto';
import { UpdateRolUseCase } from '../../application/use-cases/update-rol.use-case';
import { DeleteRolUseCase } from '../../application/use-cases/delete-rol.use-case';
import { UpdateRolDTO } from '../../application/dto/update-rol-dto';
import { CreateRolSwagger } from '../documentation/create-rol.swagger';
import { GetAllRolSwagger } from '../documentation/get-all-rol.swagger';
import { UpdateRolSwagger } from '../documentation/update-rol.swagger';
import { DeleteRolSwagger } from '../documentation/delete-rol.swagger';
import { GetRolByIdSwagger } from '../documentation/get-rol-by-id.swagger';

@ApiTags('Roles')
@Controller('roles')
export class RolController {
  constructor(
    private readonly createRolUseCase: CreateRolUseCase,
    private readonly getRolByIdUseCase: GetRolByIdUseCase,
    private readonly getAllRolUseCase: GetAllRolUseCase,
    private readonly updateRolUseCase: UpdateRolUseCase,
    private readonly deleteRolUseCase: DeleteRolUseCase,
  ) {}

  @Post()
  @CreateRolSwagger()
  async create(@Body() dto: CreateRolDTO): Promise<Rol> {
    return this.createRolUseCase.ejecutar(dto);
  }

  @Get()
  @GetAllRolSwagger()
  async getAll(@Query() filters: FiltersRolDTO): Promise<{
    data: Rol[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllRolUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetRolByIdSwagger()
  async getById(@Param('id', ParseIntPipe) rolId: number): Promise<Rol> {
    const rol = await this.getRolByIdUseCase.ejecutar(rolId);
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    return rol;
  }

  @Put(':id')
  @UpdateRolSwagger()
  async update(
    @Param('id', ParseIntPipe) rolId: number,
    @Body() dto: UpdateRolDTO,
  ): Promise<Rol> {
    try {
      return await this.updateRolUseCase.ejecutar(rolId, dto);
    } catch {
      throw new NotFoundException('Rol no encontrado');
    }
  }

  @Delete(':id')
  @DeleteRolSwagger()
  async delete(
    @Param('id', ParseIntPipe) rolId: number,
  ): Promise<{ success: boolean }> {
    const deleted = await this.deleteRolUseCase.ejecutar(rolId);
    if (!deleted) {
      throw new NotFoundException('Rol no encontrado');
    }
    return { success: true };
  }
}
