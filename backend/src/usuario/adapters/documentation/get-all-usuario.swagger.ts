import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUsuarioDTO } from '../../application/dto/create-usuario-dto';

export function GetAllUsuariosSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los usuarios',
      description: 'Retorna una lista de todos los usuarios disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de usuarios obtenida exitosamente',
      type: [CreateUsuarioDTO],
    }),
  );
}
