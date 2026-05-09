import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePedidoDTO } from '../../application/dto/create-pedido-dto';

export function GetAllPedidoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los pedidos',
      description: 'Retorna una lista de todos los pedidos disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de pedidos obtenida exitosamente',
      type: [CreatePedidoDTO],
    }),
  );
}
