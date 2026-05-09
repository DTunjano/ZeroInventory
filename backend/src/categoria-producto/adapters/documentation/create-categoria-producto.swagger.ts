import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoriaProductoDTO } from '../../application/dto/create-categoria-producto-dto';

export function CreateCategoriaProductoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una nueva relación categoría-producto',
      description: 'Crea una nueva relación entre una categoría y un producto',
    }),

    ApiBody({
      type: CreateCategoriaProductoDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Relación creada exitosamente',
      type: CreateCategoriaProductoDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
