import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateCompraDTO } from '../../application/dto/update-compra-dto';

export function UpdateCompraSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar una compra',
      description: 'Actualiza los datos de una compra existente',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único de la compra',
      example: 1,
    }),

    ApiBody({
      type: UpdateCompraDTO,
    }),

    ApiResponse({
      status: 200,
      description: 'Compra actualizada exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Compra no encontrada',
    }),
  );
}
