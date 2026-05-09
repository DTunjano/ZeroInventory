import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeletePedidoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un pedido',
      description: 'Elimina un pedido existente',
    }),

    ApiResponse({
      status: 200,
      description: 'Pedido eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Pedido no encontrado',
    }),
  );
}
