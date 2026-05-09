import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoriaProductoDTO } from '../../application/dto/create-categoria-producto-dto';

export function GetAllCategoriaProductoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las relaciones categoría-producto',
      description: 'Retorna una lista de todas las relaciones categoría-producto disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de relaciones obtenida exitosamente',
      type: [CreateCategoriaProductoDTO],
    }),
  );
}
