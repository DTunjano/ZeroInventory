import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoriaProductoDTO } from '../../application/dto/create-categoria-producto-dto';

export function GetCategoriaProductoByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener relación categoría-producto por ID',
      description: 'Retorna los datos de una relación categoría-producto específica',
    }),

    ApiResponse({
      status: 200,
      description: 'Relación obtenida exitosamente',
      type: CreateCategoriaProductoDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Relación no encontrada',
    }),
  );
}
