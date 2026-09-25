import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteUsuarioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un usuario',
      description: 'Elimina un usuario de la base de datos',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del usuario',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Usuario eliminado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado',
    }),
  );
}
