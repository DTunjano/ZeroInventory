import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetAllUsuarioRolSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las asignaciones usuario-rol con paginación',
    }),
    ApiResponse({ status: 200, description: 'Listado de asignaciones' }),
  );
}
