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
import { CreateUsuarioUseCase } from '../../application/use-cases/create-usuario.use-case';
import { Usuario } from '../../domain/entity/usuario.entity';
import { CreateUsuarioDTO } from '../../application/dto/create-usuario-dto';
import { GetUsuarioByIdUseCase } from '../../application/use-cases/get-usuario-by-id.use-case';
import { GetAllUsuariosUseCase } from '../../application/use-cases/get-all-usuario.use-case';
import { FiltersUsuarioDTO } from '../../application/dto/filters-usuario-dto';
import { UpdateUsuarioUseCase } from '../../application/use-cases/update-usuario.use-case';
import { DeleteUsuarioUseCase } from '../../application/use-cases/delete-usuario.use-case';
import { UpdateUsuarioDTO } from '../../application/dto/update-usuario-dto';
import { CreateUsuarioSwagger } from '../documentation/create-usuario.swagger';
import { GetAllUsuariosSwagger } from '../documentation/get-all-usuario.swagger';
import { UpdateUsuarioSwagger } from '../documentation/update-usuario.swagger';
import { DeleteUsuarioSwagger } from '../documentation/delete-usuario.swagger';
import { GetUsuarioByIdSwagger } from '../documentation/get-usuario-by-id.swagger';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly createUsuarioUseCase: CreateUsuarioUseCase,
    private readonly getUsuarioByIdUseCase: GetUsuarioByIdUseCase,
    private readonly getAllUsuariosUseCase: GetAllUsuariosUseCase,
    private readonly updateUsuarioUseCase: UpdateUsuarioUseCase,
    private readonly deleteUsuarioUseCase: DeleteUsuarioUseCase,
  ) {}

  @Post()
  @CreateUsuarioSwagger()
  async create(@Body() body: CreateUsuarioDTO): Promise<Usuario> {
    const usuario = await this.createUsuarioUseCase.ejecutar(body);
    if (!usuario) {
      throw new NotFoundException('No se pudo crear el usuario');
    }
    return usuario;
  }

  @Get()
  @GetAllUsuariosSwagger()
  async getAll(@Query() filters?: FiltersUsuarioDTO): Promise<{
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllUsuariosUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetUsuarioByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) usuarioId: number,
  ): Promise<Usuario> {
    const usuario = await this.getUsuarioByIdUseCase.ejecutar(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  @Put(':id')
  @UpdateUsuarioSwagger()
  async update(
    @Param('id', ParseIntPipe) usuarioId: number,
    @Body() body: UpdateUsuarioDTO,
  ): Promise<Usuario> {
    const usuario = await this.updateUsuarioUseCase.ejecutar(usuarioId, body);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  @Delete(':id')
  @DeleteUsuarioSwagger()
  async remove(@Param('id', ParseIntPipe) usuarioId: number): Promise<void> {
    return this.deleteUsuarioUseCase.ejecutar(usuarioId);
  }
}
