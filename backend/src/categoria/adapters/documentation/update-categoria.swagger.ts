import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateCategoriaDTO } from '../../application/dto/update-categoria-dto';

export function UpdateCategoriaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar una categoría',
      description: 'Actualiza los datos de una categoría existente',
    }),

    ApiResponse({
      status: 200,
      description: 'Categoría actualizada exitosamente',
      type: UpdateCategoriaDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Categoría no encontrada',
    }),
  );
}
