import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateClienteDTO } from '../../application/dto/create-cliente-dto';

export function GetAllClientesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los clientes',
      description: 'Retorna una lista de todos los clientes disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de clientes obtenida exitosamente',
      type: [CreateClienteDTO],
    }),
  );
}
