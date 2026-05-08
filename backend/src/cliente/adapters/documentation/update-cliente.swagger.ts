import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateClienteDTO } from '../../application/dto/update-cliente-dto';

export function UpdateClienteSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un cliente',
      description: 'Actualiza los datos de un cliente existente',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del cliente',
      example: 1,
    }),

    ApiBody({ type: UpdateClienteDTO }),

    ApiResponse({
      status: 200,
      description: 'Cliente actualizado exitosamente',
      type: UpdateClienteDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Cliente no encontrado',
    }),
  );
}
