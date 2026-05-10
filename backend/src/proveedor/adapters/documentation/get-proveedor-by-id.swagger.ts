import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function GetProveedorByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un proveedor por ID',
      description: 'Retorna los datos de un proveedor específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del proveedor',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Proveedor encontrado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Proveedor no encontrado',
    }),
  );
}
