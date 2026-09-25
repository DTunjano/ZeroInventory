import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDireccionDTO } from '../../application/dto/create-direccion-dto';

export function GetDireccionByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener dirección por ID',
      description: 'Retorna los datos de una dirección específica',
    }),

    ApiResponse({
      status: 200,
      description: 'Dirección obtenida exitosamente',
      type: CreateDireccionDTO,
    }),

    ApiResponse({
      status: 404,
      description: 'Dirección no encontrada',
    }),
  );
}
