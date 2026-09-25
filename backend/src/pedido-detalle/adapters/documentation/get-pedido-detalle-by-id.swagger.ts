import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetPedidoDetalleByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un detalle de pedido por ID' }),
    ApiResponse({ status: 200, description: 'Detalle de pedido encontrado' }),
    ApiResponse({
      status: 404,
      description: 'Detalle de pedido no encontrado',
    }),
  );
}
