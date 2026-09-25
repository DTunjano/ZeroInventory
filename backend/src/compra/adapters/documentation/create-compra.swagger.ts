import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCompraDTO } from '../../application/dto/create-compra-dto';

export function CreateCompraSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una nueva compra',
      description: 'Crea una nueva compra con los datos proporcionados',
    }),

    ApiBody({
      type: CreateCompraDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Compra creada exitosamente',
      type: CreateCompraDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
