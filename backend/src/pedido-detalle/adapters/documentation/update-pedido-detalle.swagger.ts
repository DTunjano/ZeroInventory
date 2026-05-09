import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function UpdatePedidoDetalleSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un detalle de pedido' }),
    ApiResponse({
      status: 200,
      description: 'Detalle de pedido actualizado exitosamente',
    }),
    ApiResponse({
      status: 404,
      description: 'Detalle de pedido no encontrado',
    }),
  );
}
