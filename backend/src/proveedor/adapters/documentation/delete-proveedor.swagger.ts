import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteProveedorSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un proveedor',
      description: 'Elimina un proveedor de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del proveedor',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Proveedor eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Proveedor no encontrado',
    }),
  );
}
