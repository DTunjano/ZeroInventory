import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateCategoriaProductoDTO } from '../../application/dto/update-categoria-producto-dto';

export function UpdateCategoriaProductoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar una relación categoría-producto',
      description: 'Actualiza los datos de una relación categoría-producto existente',
    }),

    ApiResponse({
      status: 200,
      description: 'Relación actualizada exitosamente',
      type: UpdateCategoriaProductoDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Relación no encontrada',
    }),
  );
}
