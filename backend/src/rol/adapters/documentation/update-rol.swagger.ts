import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function UpdateRolSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un rol' }),
    ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' }),
    ApiResponse({ status: 404, description: 'Rol no encontrado' }),
  );
}
