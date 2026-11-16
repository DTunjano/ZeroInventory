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
import { CreateClienteUseCase } from '../../application/use-cases/create-cliente.use-case';
import { Cliente } from '../../domain/entity/cliente.entity';
import { CreateClienteDTO } from '../../application/dto/create-cliente-dto';
import { GetClienteByIdUseCase } from '../../application/use-cases/get-cliente-by-id.use-case';
import { GetAllClientesUseCase } from '../../application/use-cases/get-all-cliente.use-case';
import { FiltersClienteDTO } from '../../application/dto/filters-cliente-dto';
import { UpdateClienteUseCase } from '../../application/use-cases/update-cliente.use-case';
import { DeleteClienteUseCase } from '../../application/use-cases/delete-cliente.use-case';
import { UpdateClienteDTO } from '../../application/dto/update-cliente-dto';
import { CreateClienteSwagger } from '../documentation/create-cliente.swagger';
import { GetAllClientesSwagger } from '../documentation/get-all-cliente.swagger';
import { UpdateClienteSwagger } from '../documentation/update-cliente.swagger';
import { DeleteClienteSwagger } from '../documentation/delete-cliente.swagger';
import { GetClienteByIdSwagger } from '../documentation/get-cliente-by-id.swagger';
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

@ApiTags('Clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly getClienteByIdUseCase: GetClienteByIdUseCase,
    private readonly getAllClientesUseCase: GetAllClientesUseCase,
    private readonly updateClienteUseCase: UpdateClienteUseCase,
    private readonly deleteClienteUseCase: DeleteClienteUseCase,
  ) {}

  @Post()
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @CreateClienteSwagger()
  async create(@Body() body: CreateClienteDTO): Promise<Cliente> {
    const cliente = await this.createClienteUseCase.ejecutar(body);
    if (!cliente) {
      throw new NotFoundException('No se pudo crear el cliente');
    }
    return cliente;
  }

  @Get()
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @GetAllClientesSwagger()
  async getAll(@Query() filters?: FiltersClienteDTO): Promise<{
    data: Cliente[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllClientesUseCase.ejecutar(filters);
  }

  @Get(':id')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @GetClienteByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) clienteId: number,
  ): Promise<Cliente> {
    const cliente = await this.getClienteByIdUseCase.ejecutar(clienteId);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  @Put(':id')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @UpdateClienteSwagger()
  async update(
    @Param('id', ParseIntPipe) clienteId: number,
    @Body() body: UpdateClienteDTO,
  ): Promise<Cliente> {
    const cliente = await this.updateClienteUseCase.ejecutar(clienteId, body);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  @Delete(':id')
  @Roles(RolNombreEnum.ADMIN)
  @DeleteClienteSwagger()
  async remove(@Param('id', ParseIntPipe) clienteId: number): Promise<void> {
    return this.deleteClienteUseCase.ejecutar(clienteId);
  }
}
