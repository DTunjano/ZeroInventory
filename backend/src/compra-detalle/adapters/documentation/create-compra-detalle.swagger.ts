import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCompraDetalleDTO } from '../../application/dto/create-compra-detalle-dto';

export function CreateCompraDetalleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo detalle de compra',
      description:
        'Crea un nuevo detalle de compra con los datos proporcionados',
    }),

    ApiBody({
      type: CreateCompraDetalleDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Detalle de compra creado exitosamente',
      type: CreateCompraDetalleDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
