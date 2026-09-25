import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteCategoriaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar una categoría',
      description: 'Elimina una categoría existente',
    }),

    ApiResponse({
      status: 200,
      description: 'Categoría eliminada exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Categoría no encontrada',
    }),
  );
}
