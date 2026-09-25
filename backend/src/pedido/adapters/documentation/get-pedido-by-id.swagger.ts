import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePedidoDTO } from '../../application/dto/create-pedido-dto';

export function GetPedidoByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener pedido por ID',
      description: 'Retorna los datos de un pedido específico',
    }),

    ApiResponse({
      status: 200,
      description: 'Pedido obtenido exitosamente',
      type: CreatePedidoDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Pedido no encontrado',
    }),
  );
}
