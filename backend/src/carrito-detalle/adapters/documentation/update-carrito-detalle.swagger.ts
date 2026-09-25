import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateCarritoDetalleDTO } from '../../application/dto/update-carrito-detalle-dto';

export function UpdateCarritoDetalleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un detalle de carrito',
      description: 'Actualiza los datos de un detalle de carrito existente',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del detalle de carrito',
      example: 1,
    }),

    ApiBody({ type: UpdateCarritoDetalleDTO }),

    ApiResponse({
      status: 200,
      description: 'Detalle de carrito actualizado exitosamente',
      type: UpdateCarritoDetalleDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Detalle de carrito no encontrado',
    }),
  );
}
