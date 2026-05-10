import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCarritoDTO } from '../../application/dto/create-carrito-dto';

export function CreateCarritoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo carrito',
      description: 'Crea un nuevo carrito con los datos proporcionados',
    }),

    ApiBody({
      type: CreateCarritoDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Carrito creado exitosamente',
      type: CreateCarritoDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
