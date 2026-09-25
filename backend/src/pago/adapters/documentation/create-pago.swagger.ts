import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function CreatePagoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo pago' }),
    ApiResponse({ status: 201, description: 'Pago creado exitosamente' }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
  );
}
