import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmpleadoConRoles } from '../domain/entity/empleado.entity';
import { CrearEmpleadoDTO } from '../application/dto/crear-empleado.dto';
import { ActualizarEmpleadoDTO } from '../application/dto/actualizar-empleado.dto';
import { CrearEmpleadoUseCase } from '../application/use-case/crear-empleado.use-case';
import { ListarEmpleadosUseCase } from '../application/use-case/listar-empleados.use-case';
import { ObtenerEmpleadoUseCase } from '../application/use-case/obtener-empleado.use-case';
import { ActualizarEmpleadoUseCase } from '../application/use-case/actualizar-empleado.use-case';
import { ToggleEmpleadoUseCase } from '../application/use-case/toggle-empleado.use-case';
import { JwtAuthGuard } from '../../auth/adapters/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/adapters/guards/roles.guard';
import { Roles } from '../../auth/adapters/decorators/roles.decorator';
import { RolNombreEnum } from '../../rol/domain/entity/rol.entity';

@ApiTags('Empleados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('empleados')
export class EmpleadoController {
  constructor(
    private readonly crearEmpleadoUseCase: CrearEmpleadoUseCase,
    private readonly listarEmpleadosUseCase: ListarEmpleadosUseCase,
    private readonly obtenerEmpleadoUseCase: ObtenerEmpleadoUseCase,
    private readonly actualizarEmpleadoUseCase: ActualizarEmpleadoUseCase,
    private readonly toggleEmpleadoUseCase: ToggleEmpleadoUseCase,
  ) {}

  @Post()
  @Roles(RolNombreEnum.ADMIN)
  async crear(@Body() body: CrearEmpleadoDTO): Promise<EmpleadoConRoles> {
    const empleado = await this.crearEmpleadoUseCase.ejecutar(body);
    if (!empleado) {
      throw new NotFoundException('No se pudo crear el empleado');
    }
    return empleado;
  }

  @Get()
  @Roles(RolNombreEnum.ADMIN)
  async listar(
    @Query('nombre') nombre?: string,
    @Query('email') email?: string,
    @Query('estado') estado?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{
    data: EmpleadoConRoles[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.listarEmpleadosUseCase.ejecutar({
      nombre,
      email,
      estado,
      page,
      limit,
    });
  }

  @Get(':id')
  @Roles(RolNombreEnum.ADMIN)
  async obtenerPorId(
    @Param('id', ParseIntPipe) empleadoId: number,
  ): Promise<EmpleadoConRoles> {
    return this.obtenerEmpleadoUseCase.ejecutar(empleadoId);
  }

  @Put(':id')
  @Roles(RolNombreEnum.ADMIN)
  async actualizar(
    @Param('id', ParseIntPipe) empleadoId: number,
    @Body() body: ActualizarEmpleadoDTO,
  ): Promise<EmpleadoConRoles> {
    return this.actualizarEmpleadoUseCase.ejecutar(empleadoId, body);
  }

  @Patch(':id/estado')
  @Roles(RolNombreEnum.ADMIN)
  async toggleEstado(
    @Param('id', ParseIntPipe) empleadoId: number,
  ): Promise<EmpleadoConRoles> {
    return this.toggleEmpleadoUseCase.ejecutar(empleadoId);
  }
}
