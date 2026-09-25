import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetRolByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un rol por ID' }),
    ApiResponse({ status: 200, description: 'Rol encontrado' }),
    ApiResponse({ status: 404, description: 'Rol no encontrado' }),
  );
}
