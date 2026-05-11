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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';
import { CreateDireccionUseCase } from '../../application/use-cases/create-direccion.use-case';
import { Direccion } from '../../domain/entity/direccion.entity';
import { CreateDireccionDTO } from '../../application/dto/create-direccion-dto';
import { GetDireccionByIdUseCase } from '../../application/use-cases/get-direccion-by-id.use-case';
import { GetAllDireccionesUseCase } from '../../application/use-cases/get-all-direccion.use-case';
import { FiltersDireccionDTO } from '../../application/dto/filters-direccion-dto';
import { UpdateDireccionUseCase } from '../../application/use-cases/update-direccion.use-case';
import { DeleteDireccionUseCase } from '../../application/use-cases/delete-direccion.use-case';
import { UpdateDireccionDTO } from '../../application/dto/update-direccion-dto';
import { CreateMyDireccionDTO } from '../../application/dto/create-my-direccion.dto';
import { CreateMyDireccionUseCase } from '../../application/use-cases/create-my-direccion.use-case';
import { GetMyDireccionesUseCase } from '../../application/use-cases/get-my-direcciones.use-case';
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
    private readonly createMyDireccionUseCase: CreateMyDireccionUseCase,
    private readonly getDireccionByIdUseCase: GetDireccionByIdUseCase,
    private readonly getAllDireccionesUseCase: GetAllDireccionesUseCase,
    private readonly getMyDireccionesUseCase: GetMyDireccionesUseCase,
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

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.CUSTOMER)
  async getMy(@Req() req: Request): Promise<Direccion[]> {
    const authRequest = req as Request & { user: { sub: number } }
    return this.getMyDireccionesUseCase.ejecutar(authRequest.user.sub);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.CUSTOMER)
  async createMy(
    @Req() req: Request,
    @Body() body: CreateMyDireccionDTO,
  ): Promise<Direccion> {
    const authRequest = req as Request & { user: { sub: number } }
    const direccion = await this.createMyDireccionUseCase.ejecutar(authRequest.user.sub, body);
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
