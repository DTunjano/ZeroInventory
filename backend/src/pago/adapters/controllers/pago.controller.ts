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
import { CreatePagoUseCase } from '../../application/use-cases/create-pago.use-case';
import { Pago } from '../../domain/entity/pago.entity';
import { CreatePagoDTO } from '../../application/dto/create-pago-dto';
import { GetPagoByIdUseCase } from '../../application/use-cases/get-pago-by-id.use-case';
import { GetAllPagoUseCase } from '../../application/use-cases/get-all-pago.use-case';
import { FiltersPagoDTO } from '../../application/dto/filters-pago-dto';
import { UpdatePagoUseCase } from '../../application/use-cases/update-pago.use-case';
import { DeletePagoUseCase } from '../../application/use-cases/delete-pago.use-case';
import { UpdatePagoDTO } from '../../application/dto/update-pago-dto';
import { CreatePagoSwagger } from '../documentation/create-pago.swagger';
import { ConfirmPagoUseCase } from '../../application/use-cases/confirm-pago.use-case';
import { GetAllPagoSwagger } from '../documentation/get-all-pago.swagger';
import { UpdatePagoSwagger } from '../documentation/update-pago.swagger';
import { DeletePagoSwagger } from '../documentation/delete-pago.swagger';
import { GetPagoByIdSwagger } from '../documentation/get-pago-by-id.swagger';
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

@ApiTags('Pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagos')
export class PagoController {
  constructor(
    private readonly createPagoUseCase: CreatePagoUseCase,
    private readonly getPagoByIdUseCase: GetPagoByIdUseCase,
    private readonly getAllPagoUseCase: GetAllPagoUseCase,
    private readonly updatePagoUseCase: UpdatePagoUseCase,
    private readonly deletePagoUseCase: DeletePagoUseCase,
    private readonly confirmPagoUseCase: ConfirmPagoUseCase,
  ) {}

  @Post()
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @CreatePagoSwagger()
  async create(@Body() dto: CreatePagoDTO): Promise<Pago> {
    return this.createPagoUseCase.ejecutar(dto);
  }

  @Get()
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @GetAllPagoSwagger()
  async getAll(@Query() filters: FiltersPagoDTO): Promise<{
    data: Pago[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllPagoUseCase.ejecutar(filters);
  }

  @Get(':id')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @GetPagoByIdSwagger()
  async getById(@Param('id', ParseIntPipe) pagoId: number): Promise<Pago> {
    const pago = await this.getPagoByIdUseCase.ejecutar(pagoId);
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
    return pago;
  }

  @Put(':id')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @UpdatePagoSwagger()
  async update(
    @Param('id', ParseIntPipe) pagoId: number,
    @Body() dto: UpdatePagoDTO,
  ): Promise<Pago> {
    try {
      return await this.updatePagoUseCase.ejecutar(pagoId, dto);
    } catch {
      throw new NotFoundException('Pago no encontrado');
    }
  }

  @Delete(':id')
  @Roles(RolNombreEnum.ADMIN)
  @DeletePagoSwagger()
  async delete(
    @Param('id', ParseIntPipe) pagoId: number,
  ): Promise<{ success: boolean }> {
    const deleted = await this.deletePagoUseCase.ejecutar(pagoId);
    if (!deleted) {
      throw new NotFoundException('Pago no encontrado');
    }
    return { success: true };
  }

  @Post(':id/confirm')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  async confirm(@Param('id', ParseIntPipe) pagoId: number): Promise<{ success: boolean }> {
    await this.confirmPagoUseCase.ejecutar(pagoId);
    return { success: true };
  }
}
