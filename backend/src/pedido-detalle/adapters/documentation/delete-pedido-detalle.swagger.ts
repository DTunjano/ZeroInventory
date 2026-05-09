import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeletePedidoDetalleSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un detalle de pedido' }),
    ApiResponse({
      status: 200,
      description: 'Detalle de pedido eliminado exitosamente',
    }),
    ApiResponse({
      status: 404,
      description: 'Detalle de pedido no encontrado',
    }),
  );
}
