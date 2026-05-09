import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetAllPagoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener todos los pagos con paginación' }),
    ApiResponse({ status: 200, description: 'Listado de pagos' }),
  );
}
