import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteUsuarioRolSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar una asignación usuario-rol' }),
    ApiResponse({
      status: 200,
      description: 'Asignación eliminada exitosamente',
    }),
    ApiResponse({ status: 404, description: 'Asignación no encontrada' }),
  );
}
