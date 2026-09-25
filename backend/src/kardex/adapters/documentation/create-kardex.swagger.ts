import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateKardexDTO } from '../../application/dto/create-kardex-dto';

export function CreateKardexSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo registro kardex',
      description: 'Crea un nuevo registro kardex con los datos proporcionados',
    }),

    ApiBody({
      type: CreateKardexDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Registro kardex creado exitosamente',
      type: CreateKardexDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
