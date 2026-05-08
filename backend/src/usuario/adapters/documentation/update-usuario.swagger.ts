import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateUsuarioDTO } from '../../application/dto/update-usuario-dto';

export function UpdateUsuarioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un usuario',
      description: 'Actualiza los datos de un usuario existente',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del usuario',
      example: 1,
    }),

    ApiBody({ type: UpdateUsuarioDTO }),

    ApiResponse({
      status: 200,
      description: 'Usuario actualizado exitosamente',
      type: UpdateUsuarioDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado',
    }),
  );
}
