import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function GetCompraDetalleByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un detalle de compra por ID',
      description: 'Retorna los datos de un detalle de compra específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del detalle de compra',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Detalle de compra encontrado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Detalle de compra no encontrado',
    }),
  );
}
