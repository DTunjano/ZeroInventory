import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateClienteDTO } from '../../application/dto/create-cliente-dto';

export function GetClienteByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un cliente por ID',
      description: 'Retorna los detalles de un cliente específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del cliente',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Cliente obtenido exitosamente',
      type: CreateClienteDTO,
    }),

    ApiResponse({ status: 404, description: 'Cliente no encontrado' }),
  );
}
