import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger'

import { CreateKardexMovementUseCase } from '../../application/use-cases/create-kardex-movement.use-case'
import { ValidateStockUseCase } from '../../application/use-cases/validate-stock.use-case'
import { CreateKardexMovementDto, RegisterStockAdjustmentDto } from '../../application/dtos/inventory.dto'
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard'
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard'
import { Roles } from '../../../auth/adapters/decorators/roles.decorator'
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity'
import { CurrentUser } from '../../../auth/adapters/decorators/current-user.decorator'
import { RegisterStockAdjustmentUseCase } from '../../application/use-cases/register-stock-adjustment.use-case'

@ApiTags('Inventario / Kardex')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(
    private readonly createKardexMovementUseCase: CreateKardexMovementUseCase,
    private readonly validateStockUseCase: ValidateStockUseCase,
    private readonly registerStockAdjustmentUseCase: RegisterStockAdjustmentUseCase,
  ) {}

  /**
   * Crear movimiento en Kardex
   * Registra ENTRADA, SALIDA o AJUSTE de inventario
   */
  @Post('kardex/movements')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear movimiento en Kardex',
    description: 'Registra un movimiento de inventario (ENTRADA, SALIDA, AJUSTE)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Movimiento creado exitosamente',
    schema: {
      example: {
        kardexId: 1,
        productoId: 1,
        tipoMovimiento: 'SALIDA',
        cantidad: 10,
        costoUnitario: 100,
        valorTotal: 1000,
        referenciaId: 42,
        tipoReferencia: 'VENTA',
        fechaMovimiento: '2026-05-13T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autenticado',
  })
  async createMovement(@Body() dto: CreateKardexMovementDto) {
    const result = await this.createKardexMovementUseCase.ejecutar(dto)
    return result
  }

  /**
   * Validar disponibilidad de stock
   * Verifica si hay suficiente cantidad disponible
   */
  @Get('stock/validate/:productoId/:cantidad')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @ApiOperation({
    summary: 'Validar stock disponible',
    description: 'Verifica si hay suficiente cantidad de un producto disponible',
  })
  @ApiParam({
    name: 'productoId',
    description: 'ID del producto',
    example: 1,
  })
  @ApiParam({
    name: 'cantidad',
    description: 'Cantidad a validar',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validación de stock realizada',
    schema: {
      example: {
        isValid: true,
        currentStock: 50,
        requestedQuantity: 10,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock insuficiente',
    schema: {
      example: {
        isValid: false,
        currentStock: 5,
        requestedQuantity: 10,
        error: 'Stock insuficiente. Disponible: 5, Solicitado: 10',
      },
    },
  })
  async validateStock(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Param('cantidad', ParseIntPipe) cantidad: number,
  ) {
    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser positiva')
    }

    const result = await this.validateStockUseCase.ejecutar(productoId, cantidad)
    return result
  }

  /**
   * Registrar ajuste de inventario
   * Crea un registro de auditoría completo con stock_anterior y stock_nuevo
   */
  @Post('adjustments')
  @Roles(RolNombreEnum.ADMIN, RolNombreEnum.EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar ajuste de inventario',
    description: 'Crea un ajuste de stock con auditoría completa (stock_anterior, stock_nuevo, tipoCambio)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ajuste registrado exitosamente',
    schema: {
      example: {
        ajusteInventarioId: 1,
        productoId: 1,
        usuarioId: 5,
        cantidad: 50,
        stockAnterior: 100,
        stockNuevo: 150,
        tipoCambio: 'AUMENTO',
        motivo: 'Entrada de proveedores',
        fecha: '2026-05-13T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o incongruentes',
  })
  async registerAdjustment(
    @Body() dto: RegisterStockAdjustmentDto,
    @CurrentUser() usuarioId: number,
  ) {
    if (dto.cantidad !== Math.abs(dto.stockNuevo - dto.stockAnterior)) {
      throw new BadRequestException('cantidad no coincide con el cambio de stock')
    }
    const result = await this.registerStockAdjustmentUseCase.ejecutar(usuarioId, {
      productoId: dto.productoId,
      stockAnterior: dto.stockAnterior,
      stockNuevo: dto.stockNuevo,
      motivo: dto.motivo,
    })

    return result
  }
}
