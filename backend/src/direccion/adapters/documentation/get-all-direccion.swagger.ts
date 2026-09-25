import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDireccionDTO } from '../../application/dto/create-direccion-dto';

export function GetAllDireccionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las direcciones',
      description: 'Retorna una lista de todas las direcciones disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de direcciones obtenida exitosamente',
      type: [CreateDireccionDTO],
    }),
  );
}
