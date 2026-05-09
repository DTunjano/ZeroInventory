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
import { CreateUsuarioRolUseCase } from '../../application/use-cases/create-usuario-rol.use-case';
import { UsuarioRol } from '../../domain/entity/usuario-rol.entity';
import { CreateUsuarioRolDTO } from '../../application/dto/create-usuario-rol-dto';
import { GetUsuarioRolByIdUseCase } from '../../application/use-cases/get-usuario-rol-by-id.use-case';
import { GetAllUsuarioRolUseCase } from '../../application/use-cases/get-all-usuario-rol.use-case';
import { FiltersUsuarioRolDTO } from '../../application/dto/filters-usuario-rol-dto';
import { UpdateUsuarioRolUseCase } from '../../application/use-cases/update-usuario-rol.use-case';
import { DeleteUsuarioRolUseCase } from '../../application/use-cases/delete-usuario-rol.use-case';
import { UpdateUsuarioRolDTO } from '../../application/dto/update-usuario-rol-dto';
import { CreateUsuarioRolSwagger } from '../documentation/create-usuario-rol.swagger';
import { GetAllUsuarioRolSwagger } from '../documentation/get-all-usuario-rol.swagger';
import { UpdateUsuarioRolSwagger } from '../documentation/update-usuario-rol.swagger';
import { DeleteUsuarioRolSwagger } from '../documentation/delete-usuario-rol.swagger';
import { GetUsuarioRolByIdSwagger } from '../documentation/get-usuario-rol-by-id.swagger';

@ApiTags('Usuario Roles')
@Controller('usuario-roles')
export class UsuarioRolController {
  constructor(
    private readonly createUsuarioRolUseCase: CreateUsuarioRolUseCase,
    private readonly getUsuarioRolByIdUseCase: GetUsuarioRolByIdUseCase,
    private readonly getAllUsuarioRolUseCase: GetAllUsuarioRolUseCase,
    private readonly updateUsuarioRolUseCase: UpdateUsuarioRolUseCase,
    private readonly deleteUsuarioRolUseCase: DeleteUsuarioRolUseCase,
  ) {}

  @Post()
  @CreateUsuarioRolSwagger()
  async create(@Body() dto: CreateUsuarioRolDTO): Promise<UsuarioRol> {
    return this.createUsuarioRolUseCase.ejecutar(dto);
  }

  @Get()
  @GetAllUsuarioRolSwagger()
  async getAll(@Query() filters: FiltersUsuarioRolDTO): Promise<{
    data: UsuarioRol[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllUsuarioRolUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetUsuarioRolByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) usuarioRolId: number,
  ): Promise<UsuarioRol> {
    const usuarioRol =
      await this.getUsuarioRolByIdUseCase.ejecutar(usuarioRolId);
    if (!usuarioRol) {
      throw new NotFoundException('Asignación usuario-rol no encontrada');
    }
    return usuarioRol;
  }

  @Put(':id')
  @UpdateUsuarioRolSwagger()
  async update(
    @Param('id', ParseIntPipe) usuarioRolId: number,
    @Body() dto: UpdateUsuarioRolDTO,
  ): Promise<UsuarioRol> {
    try {
      return await this.updateUsuarioRolUseCase.ejecutar(usuarioRolId, dto);
    } catch {
      throw new NotFoundException('Asignación usuario-rol no encontrada');
    }
  }
  @Delete(':id')
  @DeleteUsuarioRolSwagger()
  async delete(
    @Param('id', ParseIntPipe) usuarioRolId: number,
  ): Promise<{ success: boolean }> {
    const deleted = await this.deleteUsuarioRolUseCase.ejecutar(usuarioRolId);
    if (!deleted) {
      throw new NotFoundException('Asignación usuario-rol no encontrada');
    }
    return { success: true };
  }
}
