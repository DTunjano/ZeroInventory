import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function CreateRolSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo rol' }),
    ApiResponse({ status: 201, description: 'Rol creado exitosamente' }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
  );
}
