import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteAjusteInventarioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un ajuste de inventario',
      description: 'Elimina un ajuste de inventario de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del ajuste de inventario',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Ajuste de inventario eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Ajuste de inventario no encontrado',
    }),
  );
}
