import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateProveedorDTO } from '../../application/dto/update-proveedor-dto';

export function UpdateProveedorSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un proveedor',
      description: 'Actualiza los datos de un proveedor existente',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del proveedor',
      example: 1,
    }),

    ApiBody({
      type: UpdateProveedorDTO,
    }),

    ApiResponse({
      status: 200,
      description: 'Proveedor actualizado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Proveedor no encontrado',
    }),
  );
}
