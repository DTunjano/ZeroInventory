import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteClienteSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un cliente',
      description: 'Elimina un cliente de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del cliente',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Cliente eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Cliente no encontrado',
    }),
  );
}
