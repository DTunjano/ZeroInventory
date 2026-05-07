import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateProductDTO } from '../../application/dto/create-product-dto';

export function GetProductByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un producto por ID',
      description: 'Retorna los detalles de un producto específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del producto',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Producto obtenido exitosamente',
      type: CreateProductDTO,
    }),

    ApiResponse({ status: 404, description: 'Producto no encontrado' }),
  );
}
