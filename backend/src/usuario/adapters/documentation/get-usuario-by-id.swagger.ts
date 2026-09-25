import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateUsuarioDTO } from '../../application/dto/create-usuario-dto';

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
      type: CreateUsuarioDTO,
    }),

    ApiResponse({ status: 404, description: 'Usuario no encontrado' }),
  );
}
