import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteProductSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un producto',
      description: 'Elimina un producto de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del producto',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Producto eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Producto no encontrado',
    }),
  );
}
