import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePedidoDTO } from '../../application/dto/create-pedido-dto';

export function CreatePedidoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo pedido',
      description: 'Crea un nuevo pedido con los datos proporcionados',
    }),

    ApiBody({
      type: CreatePedidoDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Pedido creado exitosamente',
      type: CreatePedidoDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
