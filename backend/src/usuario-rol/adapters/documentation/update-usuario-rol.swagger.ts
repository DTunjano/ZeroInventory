import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function UpdateUsuarioRolSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar una asignación usuario-rol' }),
    ApiResponse({
      status: 200,
      description: 'Asignación actualizada exitosamente',
    }),
    ApiResponse({ status: 404, description: 'Asignación no encontrada' }),
  );
}
