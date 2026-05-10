import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProveedorDTO } from '../../application/dto/create-proveedor-dto';

export function GetAllProveedoresSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los proveedores',
      description: 'Retorna una lista de todos los proveedores disponibles',
    }),

    ApiResponse({
      status: 200,
      description: 'Lista de proveedores obtenida exitosamente',
      type: [CreateProveedorDTO],
    }),
  );
}
