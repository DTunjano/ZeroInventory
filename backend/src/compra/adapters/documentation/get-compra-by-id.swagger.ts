import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function GetCompraByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener una compra por ID',
      description: 'Retorna los datos de una compra específica',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único de la compra',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Compra encontrada exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Compra no encontrada',
    }),
  );
}
