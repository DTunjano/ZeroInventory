import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteKardexSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un registro kardex',
      description: 'Elimina un registro kardex de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del registro kardex',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Registro kardex eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Registro kardex no encontrado',
    }),
  );
}
