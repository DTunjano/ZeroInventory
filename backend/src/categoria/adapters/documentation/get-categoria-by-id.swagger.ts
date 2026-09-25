import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoriaDTO } from '../../application/dto/create-categoria-dto';

export function GetCategoriaByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener categoría por ID',
      description: 'Retorna los datos de una categoría específica',
    }),

    ApiResponse({
      status: 200,
      description: 'Categoría obtenida exitosamente',
      type: CreateCategoriaDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Categoría no encontrada',
    }),
  );
}
