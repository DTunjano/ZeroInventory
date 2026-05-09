import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function CreateUsuarioRolSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Asignar un rol a un usuario' }),
    ApiResponse({ status: 201, description: 'Rol asignado exitosamente' }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
  );
}
