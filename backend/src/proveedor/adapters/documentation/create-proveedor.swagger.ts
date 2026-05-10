import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProveedorDTO } from '../../application/dto/create-proveedor-dto';

export function CreateProveedorSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo proveedor',
      description: 'Crea un nuevo proveedor con los datos proporcionados',
    }),

    ApiBody({
      type: CreateProveedorDTO,
    }),

    ApiResponse({
      status: 201,
      description: 'Proveedor creado exitosamente',
      type: CreateProveedorDTO,
    }),

    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
  );
}
