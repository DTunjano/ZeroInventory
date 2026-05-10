import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCompraDTO } from '../../application/dto/create-compra-dto';

export function GetAllComprasSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las compras',
      description: 'Retorna una lista de todas las compras disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de compras obtenida exitosamente',
      type: [CreateCompraDTO],
    }),
  );
}
