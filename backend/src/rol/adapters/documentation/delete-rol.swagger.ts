import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteRolSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un rol' }),
    ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' }),
    ApiResponse({ status: 404, description: 'Rol no encontrado' }),
  );
}
