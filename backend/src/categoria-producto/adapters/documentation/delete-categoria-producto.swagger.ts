import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteCategoriaProductoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar una relación categoría-producto',
      description: 'Elimina una relación categoría-producto existente',
    }),

    ApiResponse({
      status: 200,
      description: 'Relación eliminada exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Relación no encontrada',
    }),
  );
}
