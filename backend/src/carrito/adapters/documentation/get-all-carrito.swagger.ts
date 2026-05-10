import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCarritoDTO } from '../../application/dto/create-carrito-dto';

export function GetAllCarritosSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los carritos',
      description: 'Retorna una lista de todos los carritos disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de carritos obtenida exitosamente',
      type: [CreateCarritoDTO],
    }),
  );
}
