import { UsuarioResponseDTO } from '../../application/dto/usuario-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function GetUsuarioByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un usuario por ID',
      description: 'Retorna los detalles de un usuario específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del usuario',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Usuario obtenido exitosamente',
      type: UsuarioResponseDTO,
    }),

    ApiResponse({ status: 404, description: 'Usuario no encontrado' }),
  );
}
