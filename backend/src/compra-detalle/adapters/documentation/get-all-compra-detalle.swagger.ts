import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCompraDetalleDTO } from '../../application/dto/create-compra-detalle-dto';

export function GetAllCompraDetallesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los detalles de compra',
      description:
        'Retorna una lista de todos los detalles de compra disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de detalles de compra obtenida exitosamente',
      type: [CreateCompraDetalleDTO],
    }),
  );
}
