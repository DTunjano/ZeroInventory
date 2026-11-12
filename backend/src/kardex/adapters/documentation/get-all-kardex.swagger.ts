import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateKardexDTO } from '../../application/dto/create-kardex-dto';

export function GetAllKardexSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los registros kardex',
      description:
        'Retorna una lista de todos los registros kardex disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de registros kardex obtenida exitosamente',
      type: [CreateKardexDTO],
    }),
  );
}
