import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoriaDTO } from '../../application/dto/create-categoria-dto';

export function CreateCategoriaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una nueva categoría',
      description: 'Crea una nueva categoría con los datos proporcionados',
    }),

    ApiBody({
      type: CreateCategoriaDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Categoría creada exitosamente',
      type: CreateCategoriaDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
