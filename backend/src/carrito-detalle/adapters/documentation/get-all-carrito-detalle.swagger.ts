import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCarritoDetalleDTO } from '../../application/dto/create-carrito-detalle-dto';

export function GetAllCarritoDetallesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los detalles de carritos',
      description:
        'Retorna una lista de todos los detalles de carritos disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de detalles de carritos obtenida exitosamente',
      type: [CreateCarritoDetalleDTO],
    }),
  );
}
