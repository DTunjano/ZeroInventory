import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function GetAjusteInventarioByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un ajuste de inventario por ID',
      description: 'Retorna los datos de un ajuste de inventario específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del ajuste de inventario',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Ajuste de inventario encontrado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Ajuste de inventario no encontrado',
    }),
  );
}
