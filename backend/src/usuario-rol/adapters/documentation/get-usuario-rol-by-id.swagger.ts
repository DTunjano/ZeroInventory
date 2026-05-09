import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetUsuarioRolByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener una asignación de usuario-rol por ID' }),
    ApiResponse({ status: 200, description: 'Asignación encontrada' }),
    ApiResponse({ status: 404, description: 'Asignación no encontrada' }),
  );
}
