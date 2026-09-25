import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateAjusteInventarioDTO } from '../../application/dto/update-ajuste-inventario-dto';

export function UpdateAjusteInventarioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un ajuste de inventario',
      description: 'Actualiza los datos de un ajuste de inventario existente',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del ajuste de inventario',
      example: 1,
    }),

    ApiBody({
      type: UpdateAjusteInventarioDTO,
    }),

    ApiResponse({
      status: 200,
      description: 'Ajuste de inventario actualizado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Ajuste de inventario no encontrado',
    }),
  );
}
