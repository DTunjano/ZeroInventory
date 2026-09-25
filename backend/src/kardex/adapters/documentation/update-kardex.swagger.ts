import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateKardexDTO } from '../../application/dto/update-kardex-dto';

export function UpdateKardexSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un registro kardex',
      description: 'Actualiza los datos de un registro kardex existente',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del registro kardex',
      example: 1,
    }),

    ApiBody({
      type: UpdateKardexDTO,
    }),

    ApiResponse({
      status: 200,
      description: 'Registro kardex actualizado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Registro kardex no encontrado',
    }),
  );
}
