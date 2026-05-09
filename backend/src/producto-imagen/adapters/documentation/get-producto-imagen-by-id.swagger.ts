import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetProductoImagenByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener imagen de producto por ID',
      description:
        'Obtiene los detalles de una imagen de producto específica por su ID',
    }),

    ApiResponse({
      status: 200,
      description: 'Imagen de producto encontrada',
    }),

    ApiResponse({
      status: 404,
      description: 'Imagen de producto no encontrada',
    }),
  );
}
