import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetPagoByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un pago por ID' }),
    ApiResponse({ status: 200, description: 'Pago encontrado' }),
    ApiResponse({ status: 404, description: 'Pago no encontrado' }),
  );
}
