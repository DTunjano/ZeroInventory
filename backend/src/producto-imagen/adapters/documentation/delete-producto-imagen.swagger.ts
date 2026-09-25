import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteProductoImagenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar imagen de producto',
      description: 'Elimina una imagen de producto específica',
    }),

    ApiResponse({
      status: 204,
      description: 'Imagen de producto eliminada exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Imagen de producto no encontrada',
    }),
  );
}
