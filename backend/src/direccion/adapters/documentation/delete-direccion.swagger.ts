import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteDireccionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar una dirección',
      description: 'Elimina una dirección existente',
    }),

    ApiResponse({
      status: 200,
      description: 'Dirección eliminada exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Dirección no encontrada',
    }),
  );
}
