import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDireccionDTO } from '../../application/dto/create-direccion-dto';

export function CreateDireccionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una nueva dirección',
      description: 'Crea una nueva dirección con los datos proporcionados',
    }),

    ApiBody({
      type: CreateDireccionDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Dirección creada exitosamente',
      type: CreateDireccionDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
