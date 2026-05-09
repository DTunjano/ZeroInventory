import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateDireccionDTO } from '../../application/dto/update-direccion-dto';

export function UpdateDireccionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar una dirección',
      description: 'Actualiza los datos de una dirección existente',
    }),

    ApiResponse({
      status: 200,
      description: 'Dirección actualizada exitosamente',
      type: UpdateDireccionDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Dirección no encontrada',
    }),
  );
}
