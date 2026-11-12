import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAjusteInventarioDTO } from '../../application/dto/create-ajuste-inventario-dto';

export function GetAllAjustesInventarioSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los ajustes de inventario',
      description:
        'Retorna una lista de todos los ajustes de inventario disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de ajustes de inventario obtenida exitosamente',
      type: [CreateAjusteInventarioDTO],
    }),
  );
}
