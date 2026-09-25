import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetAllPedidoDetalleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los detalles de pedido con paginación',
    }),
    ApiResponse({ status: 200, description: 'Listado de detalles de pedido' }),
  );
}
