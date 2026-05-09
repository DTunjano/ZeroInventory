import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function UpdateProductoImagenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar imagen de producto',
      description: 'Actualiza los datos de una imagen de producto existente',
    }),

    ApiBody({
      schema: {
        type: 'object',
        properties: {
          productoId: {
            type: 'number',
          },
          imagen: {
            type: 'string',
            format: 'binary',
          },
        },
        required: [],
      },
    }),

    ApiResponse({
      status: 200,
      description: 'Imagen de producto actualizada exitosamente',
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),

    ApiResponse({
      status: 404,
      description: 'Imagen de producto no encontrada',
    }),
  );
}
