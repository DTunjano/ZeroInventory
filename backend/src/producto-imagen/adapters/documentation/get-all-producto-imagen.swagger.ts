import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetAllProductoImagenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las imágenes de productos',
      description:
        'Obtiene una lista paginada de todas las imágenes de productos',
    }),

    ApiResponse({
      status: 200,
      description: 'Imágenes de productos obtenidas exitosamente',
    }),

    ApiResponse({
      status: 400,
      description: 'Parámetros de filtrado inválidos',
    }),
  );
}
