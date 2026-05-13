import { BadRequestException, Controller, DefaultValuePipe, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard'
import { Roles } from '../../../auth/adapters/decorators/roles.decorator'
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'
import { TipoCambioEnum } from '../../../entities/ajuste-inventario.orm-entity'
import { GetInventoryAdjustmentsUseCase } from '../../application/use-cases/get-inventory-adjustments.use-case'

@ApiTags('Inventario / Ajustes')
@ApiBearerAuth()
@Controller('inventory/adjustments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
export class InventoryAdjustmentsController {
  constructor(private readonly getInventoryAdjustmentsUseCase: GetInventoryAdjustmentsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Listar ajustes de inventario',
    description: 'Devuelve los ajustes de inventario paginados con filtros opcionales por producto, usuario, búsqueda y tipo de cambio.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 15 })
  @ApiQuery({ name: 'productoId', required: false, example: 12 })
  @ApiQuery({ name: 'usuarioId', required: false, example: 5 })
  @ApiQuery({ name: 'tipoCambio', required: false, enum: TipoCambioEnum })
  @ApiQuery({ name: 'search', required: false, example: 'almacén' })
  async getAdjustments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('productoId') productoId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('tipoCambio') tipoCambio?: TipoCambioEnum,
    @Query('search') search?: string,
  ) {
    const normalizedProductoId = productoId !== undefined ? Number(productoId) : undefined
    const normalizedUsuarioId = usuarioId !== undefined ? Number(usuarioId) : undefined

    if (productoId !== undefined && (normalizedProductoId === undefined || !Number.isInteger(normalizedProductoId) || normalizedProductoId <= 0)) {
      throw new BadRequestException('productoId debe ser un entero positivo')
    }

    if (usuarioId !== undefined && (normalizedUsuarioId === undefined || !Number.isInteger(normalizedUsuarioId) || normalizedUsuarioId <= 0)) {
      throw new BadRequestException('usuarioId debe ser un entero positivo')
    }

    if (tipoCambio && !Object.values(TipoCambioEnum).includes(tipoCambio)) {
      throw new BadRequestException('tipoCambio no es válido')
    }

    return this.getInventoryAdjustmentsUseCase.ejecutar({
      page,
      limit,
      productoId: normalizedProductoId,
      usuarioId: normalizedUsuarioId,
      tipoCambio,
      search,
    })
  }
}