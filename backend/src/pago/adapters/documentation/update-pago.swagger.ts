import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function UpdatePagoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un pago' }),
    ApiResponse({ status: 200, description: 'Pago actualizado exitosamente' }),
    ApiResponse({ status: 404, description: 'Pago no encontrado' }),
  );
}
