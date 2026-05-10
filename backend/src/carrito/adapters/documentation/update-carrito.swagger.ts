import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateCarritoDTO } from '../../application/dto/update-carrito-dto';

export function UpdateCarritoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un carrito',
      description: 'Actualiza los datos de un carrito existente',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del carrito',
      example: 1,
    }),

    ApiBody({ type: UpdateCarritoDTO }),

    ApiResponse({
      status: 200,
      description: 'Carrito actualizado exitosamente',
      type: UpdateCarritoDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Carrito no encontrado',
    }),
  );
}
