import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteCompraSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar una compra',
      description: 'Elimina una compra de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único de la compra',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Compra eliminada exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Compra no encontrada',
    }),
  );
}
