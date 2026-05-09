import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdatePedidoDTO } from '../../application/dto/update-pedido-dto';

export function UpdatePedidoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un pedido',
      description: 'Actualiza los datos de un pedido existente',
    }),

    ApiResponse({
      status: 200,
      description: 'Pedido actualizado exitosamente',
      type: UpdatePedidoDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Pedido no encontrado',
    }),
  );
}
