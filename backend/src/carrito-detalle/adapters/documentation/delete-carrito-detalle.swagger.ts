import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteCarritoDetalleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un detalle de carrito',
      description: 'Elimina un detalle de carrito de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del detalle de carrito',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Detalle de carrito eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Detalle de carrito no encontrado',
    }),
  );
}
