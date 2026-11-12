import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateCompraDetalleDTO } from '../../application/dto/update-compra-detalle-dto';

export function UpdateCompraDetalleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un detalle de compra',
      description: 'Actualiza los datos de un detalle de compra existente',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del detalle de compra',
      example: 1,
    }),

    ApiBody({
      type: UpdateCompraDetalleDTO,
    }),

    ApiResponse({
      status: 200,
      description: 'Detalle de compra actualizado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Detalle de compra no encontrado',
    }),
  );
}
