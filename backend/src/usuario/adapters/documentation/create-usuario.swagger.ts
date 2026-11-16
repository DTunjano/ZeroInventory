import { UsuarioResponseDTO } from '../../application/dto/usuario-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUsuarioDTO } from '../../application/dto/create-usuario-dto';

export function CreateUsuarioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo usuario',
      description: 'Crea un nuevo usuario con los datos proporcionados',
    }),

    ApiBody({
      type: CreateUsuarioDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Usuario y roles guardados atómicamente; sin contraseña en la respuesta',
      type: UsuarioResponseDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
