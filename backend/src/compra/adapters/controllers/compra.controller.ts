import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/adapters/decorators/current-user.decorator';
import { CompraWorkflowUseCase } from '../../application/compra-workflow.use-case';
import {
  CompraCancelDTO,
  CompraDraftDTO,
  CompraQueryDTO,
  CompraUpdateDTO,
  CompraVersionDTO,
} from '../../application/dto/compra-workflow.dto';

@ApiTags('Compras')
@ApiBearerAuth()
@Roles('ADMIN', 'EMPLOYEE')
@Controller('compras')
export class CompraController {
  constructor(private readonly workflow: CompraWorkflowUseCase) {}
  @Post()
  @ApiOperation({
    summary: 'Crear borrador con líneas y total calculado; no cambia stock',
  })
  create(@Body() body: CompraDraftDTO, @CurrentUser() actor: number) {
    return this.workflow.create(body, actor);
  }
  @Get()
  @ApiOperation({ summary: 'Listar compras con filtros y paginación' })
  list(@Query() filters: CompraQueryDTO) {
    return this.workflow.list(filters);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar líneas e historial de una compra' })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.workflow.get(id);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar borrador con control de versión' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CompraUpdateDTO,
    @CurrentUser() actor: number,
  ) {
    return this.workflow.update(id, body.version, body, actor);
  }
  @Post(':id/receive')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Confirmar recepción completa una sola vez; reintentos sin duplicar stock',
  })
  receive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CompraVersionDTO,
    @CurrentUser() actor: number,
  ) {
    return this.workflow.receive(id, body.version, actor);
  }
  @Patch(':id/cancel')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Cancelar borrador con motivo, conservando líneas e historial',
  })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CompraCancelDTO,
    @CurrentUser() actor: number,
  ) {
    return this.workflow.cancel(id, body.version, body.motivo, actor);
  }
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Retirado: cancelar el borrador, sin borrado físico',
    deprecated: true,
  })
  remove(@Param('id', ParseIntPipe) id: number): never {
    throw new GoneException(
      `No se borra la compra ${id}. Cancela el borrador con motivo en PATCH /compras/:id/cancel`,
    );
  }
}
