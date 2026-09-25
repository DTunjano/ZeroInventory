import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCarritoDTO } from '../../application/dto/create-carrito-dto';

export function GetCarritoByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un carrito por ID',
      description: 'Retorna los detalles de un carrito específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del carrito',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Carrito obtenido exitosamente',
      type: CreateCarritoDTO,
    }),

    ApiResponse({ status: 404, description: 'Carrito no encontrado' }),
  );
}
