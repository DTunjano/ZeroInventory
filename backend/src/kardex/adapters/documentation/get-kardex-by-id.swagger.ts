import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function GetKardexByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un registro kardex por ID',
      description: 'Retorna los datos de un registro kardex específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del registro kardex',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Registro kardex encontrado exitosamente',
    }),

    ApiResponse({
      status: 404,
      description: 'Registro kardex no encontrado',
    }),
  );
}
