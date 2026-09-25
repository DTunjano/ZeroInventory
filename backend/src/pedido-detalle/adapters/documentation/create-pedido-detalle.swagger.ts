import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function CreatePedidoDetalleSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo detalle de pedido' }),
    ApiResponse({
      status: 201,
      description: 'Detalle de pedido creado exitosamente',
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
  );
}
