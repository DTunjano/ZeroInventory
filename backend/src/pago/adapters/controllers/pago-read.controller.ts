import {
  Controller,
  Delete,
  Get,
  GoneException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { GetAllPagoUseCase } from '../../application/use-cases/get-all-pago.use-case';
import { GetPagoByIdUseCase } from '../../application/use-cases/get-pago-by-id.use-case';
import { FiltersPagoDTO } from '../../application/dto/filters-pago-dto';
@ApiTags('Pagos')
@ApiBearerAuth()
@Roles('ADMIN', 'EMPLOYEE')
@Controller('pagos')
export class PagoReadController {
  constructor(
    private readonly all: GetAllPagoUseCase,
    private readonly byId: GetPagoByIdUseCase,
  ) {}
  @Get() list(@Query() filters: FiltersPagoDTO) {
    return this.all.ejecutar(filters);
  }
  @Get(':id') async get(@Param('id', ParseIntPipe) id: number) {
    const p = await this.byId.ejecutar(id);
    if (!p) throw new NotFoundException('Pago no encontrado');
    return p;
  }
  @Post() create(): never {
    throw new GoneException(
      'El checkout crea el pago; opera desde las acciones del pedido',
    );
  }
  @Put(':id') update(@Param('id', ParseIntPipe) _id: number): never {
    void _id;
    throw new GoneException(
      'Los importes no se editan; usa las acciones auditadas del pedido',
    );
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) _id: number): never {
    void _id;
    throw new GoneException(
      'No se borran pagos; conserva el historial y registra reembolso si corresponde',
    );
  }
  @Post(':id/confirm') confirm(@Param('id', ParseIntPipe) _id: number): never {
    void _id;
    throw new GoneException(
      'Usa APROBAR_PAGO en el pedido con versión y motivo; aprobar no completa la entrega',
    );
  }
}
