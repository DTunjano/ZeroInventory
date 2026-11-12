import { BadRequestException, Controller, DefaultValuePipe, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { TipoCambioEnum } from '../../../ajuste-inventario/infrastructure/persistence/ajuste-inventario.orm-entity'
import { GetInventoryAdjustmentsUseCase } from '../../application/use-cases/get-inventory-adjustments.use-case'
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard'
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard'

@ApiTags('Inventario / Ajustes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory/adjustments')
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
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31' })
  async getAdjustments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('productoId') productoId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('tipoCambio') tipoCambio?: TipoCambioEnum,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
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
      startDate,
      endDate,
    })
  }
}