import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateClienteDTO } from '../../application/dto/create-cliente-dto';

export function CreateClienteSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo cliente',
      description: 'Crea un nuevo cliente con los datos proporcionados',
    }),

    ApiBody({
      type: CreateClienteDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Cliente creado exitosamente',
      type: CreateClienteDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
