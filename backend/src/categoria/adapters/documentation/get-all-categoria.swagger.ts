import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoriaDTO } from '../../application/dto/create-categoria-dto';

export function GetAllCategoriaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las categorías',
      description: 'Retorna una lista de todas las categorías disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de categorías obtenida exitosamente',
      type: [CreateCategoriaDTO],
    }),
  );
}
