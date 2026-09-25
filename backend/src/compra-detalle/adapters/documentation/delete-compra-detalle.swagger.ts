import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteCompraDetalleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un detalle de compra',
      description: 'Elimina un detalle de compra de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del detalle de compra',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Detalle de compra eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Detalle de compra no encontrado',
    }),
  );
}
