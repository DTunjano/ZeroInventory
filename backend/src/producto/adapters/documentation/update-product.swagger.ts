import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateProductDTO } from '../../application/dto/update-product-dto';

export function UpdateProductSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un producto',
      description: 'Actualiza los datos de un producto existente',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del producto',
      example: 1,
    }),

    ApiBody({ type: UpdateProductDTO }),

    ApiResponse({
      status: 200,
      description: 'Producto actualizado exitosamente',
      type: UpdateProductDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Producto no encontrado',
    }),
  );
}
