import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProductDTO } from '../../application/dto/create-product-dto';

export function CreateProductSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo producto',
      description: 'Crea un nuevo producto con los datos proporcionados',
    }),

    ApiBody({
      type: CreateProductDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Producto creado exitosamente',
      type: CreateProductDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
