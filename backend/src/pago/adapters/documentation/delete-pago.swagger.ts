import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeletePagoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un pago' }),
    ApiResponse({ status: 200, description: 'Pago eliminado exitosamente' }),
    ApiResponse({ status: 404, description: 'Pago no encontrado' }),
  );
}
