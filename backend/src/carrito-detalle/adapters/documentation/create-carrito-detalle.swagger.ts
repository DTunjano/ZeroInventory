import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCarritoDetalleDTO } from '../../application/dto/create-carrito-detalle-dto';

export function CreateCarritoDetalleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo detalle de carrito',
      description:
        'Crea un nuevo detalle de carrito con los datos proporcionados',
    }),

    ApiBody({
      type: CreateCarritoDetalleDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Detalle de carrito creado exitosamente',
      type: CreateCarritoDetalleDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
