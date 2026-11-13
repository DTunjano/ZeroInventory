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
import { CreateCompraUseCase } from '../../application/use-cases/create-compra.use-case';
import { Compra } from '../../domain/entity/compra.entity';
import { CreateCompraDTO } from '../../application/dto/create-compra-dto';
import { GetCompraByIdUseCase } from '../../application/use-cases/get-compra-by-id.use-case';
import { GetAllComprasUseCase } from '../../application/use-cases/get-all-compra.use-case';
import { FilterCompraDTO } from '../../application/dto/filters-compra-dto';
import { UpdateCompraUseCase } from '../../application/use-cases/update-compra.use-case';
import { DeleteCompraUseCase } from '../../application/use-cases/delete-compra.use-case';
import { UpdateCompraDTO } from '../../application/dto/update-compra-dto';
import { CreateCompraSwagger } from '../documentation/create-compra.swagger';
import { GetAllComprasSwagger } from '../documentation/get-all-compra.swagger';
import { GetCompraByIdSwagger } from '../documentation/get-compra-by-id.swagger';
import { UpdateCompraSwagger } from '../documentation/update-compra.swagger';
import { DeleteCompraSwagger } from '../documentation/delete-compra.swagger';
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

@ApiTags('Compras')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compras')
export class CompraController {
  constructor(
    private readonly createCompraUseCase: CreateCompraUseCase,
    private readonly getCompraByIdUseCase: GetCompraByIdUseCase,
    private readonly getAllComprasUseCase: GetAllComprasUseCase,
    private readonly updateCompraUseCase: UpdateCompraUseCase,
    private readonly deleteCompraUseCase: DeleteCompraUseCase,
  ) {}

  @Post()
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @CreateCompraSwagger()
  async create(@Body() body: CreateCompraDTO): Promise<Compra> {
    const compra = await this.createCompraUseCase.ejecutar(body);
    if (!compra) {
      throw new NotFoundException('No se pudo crear la compra');
    }
    return compra;
  }

  @Get()
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @GetAllComprasSwagger()
  async getAll(@Query() filters?: FilterCompraDTO): Promise<{
    data: Compra[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllComprasUseCase.ejecutar(filters);
  }

  @Get(':id')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @GetCompraByIdSwagger()
  async getById(@Param('id', ParseIntPipe) compraId: number): Promise<Compra> {
    const compra = await this.getCompraByIdUseCase.ejecutar(compraId);
    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }
    return compra;
  }

  @Put(':id')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @UpdateCompraSwagger()
  async update(
    @Param('id', ParseIntPipe) compraId: number,
    @Body() body: UpdateCompraDTO,
  ): Promise<Compra> {
    const compra = await this.updateCompraUseCase.ejecutar(compraId, body);
    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }
    return compra;
  }

  @Delete(':id')
  @Roles(RolNombreEnum.ADMIN)
  @DeleteCompraSwagger()
  async remove(@Param('id', ParseIntPipe) compraId: number): Promise<void> {
    return this.deleteCompraUseCase.ejecutar(compraId);
  }
}
