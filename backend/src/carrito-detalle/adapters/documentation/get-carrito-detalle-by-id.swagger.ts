import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCarritoDetalleDTO } from '../../application/dto/create-carrito-detalle-dto';

export function GetCarritoDetalleByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un detalle de carrito por ID',
      description: 'Retorna los detalles de un detalle de carrito específico',
    }),

    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID único del detalle de carrito',
      example: 1,
    }),

    ApiResponse({
      status: 200,
      description: 'Detalle de carrito obtenido exitosamente',
      type: CreateCarritoDetalleDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Detalle de carrito no encontrado',
    }),
  );
}
