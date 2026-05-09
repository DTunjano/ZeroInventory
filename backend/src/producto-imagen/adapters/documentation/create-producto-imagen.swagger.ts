import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProductoImagenDTO } from '../../application/dto/create-producto-imagen-dto';

export function CreateProductoImagenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una nueva imagen de producto',
      description:
        'Crea una nueva imagen de producto con los datos proporcionados',
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
      },
    }),

    ApiResponse({
      status: 201,
      description: 'Imagen de producto creada exitosamente',
      type: CreateProductoImagenDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
