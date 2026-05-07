import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProductDTO } from '../../application/dto/create-product-dto';

export function GetAllProductSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los productos',
      description: 'Retorna una lista de todos los productos disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de productos obtenida exitosamente',
      type: [CreateProductDTO],
    }),
  );
}
