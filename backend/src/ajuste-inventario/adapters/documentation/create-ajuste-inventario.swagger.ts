import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAjusteInventarioDTO } from '../../application/dto/create-ajuste-inventario-dto';

export function CreateAjusteInventarioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo ajuste de inventario',
      description:
        'Crea un nuevo ajuste de inventario con los datos proporcionados',
    }),

    ApiBody({
      type: CreateAjusteInventarioDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Ajuste de inventario creado exitosamente',
      type: CreateAjusteInventarioDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
