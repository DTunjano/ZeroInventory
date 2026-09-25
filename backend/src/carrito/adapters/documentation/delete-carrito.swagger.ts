import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteCarritoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un carrito',
      description: 'Elimina un carrito de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del carrito',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Carrito eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Carrito no encontrado',
    }),
  );
}
