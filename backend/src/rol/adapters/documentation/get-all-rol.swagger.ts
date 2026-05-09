import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetAllRolSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener todos los roles con paginación' }),
    ApiResponse({ status: 200, description: 'Listado de roles' }),
  );
}
