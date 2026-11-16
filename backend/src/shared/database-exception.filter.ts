import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Response } from 'express';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const code = (exception.driverError as { code?: string }).code;
    const messages: Record<string, [number, string]> = {
      '23503': [HttpStatus.CONFLICT, 'El registro tiene relaciones vigentes o una referencia no existe. Desactívalo para conservar el historial.'],
      '23505': [HttpStatus.CONFLICT, 'Ya existe un registro con esos datos únicos.'],
      '23514': [HttpStatus.BAD_REQUEST, 'Los datos incumplen una regla de integridad.'],
      '22003': [HttpStatus.BAD_REQUEST, 'Un importe o cantidad excede el rango permitido.'],
    };
    const [statusCode, message] = messages[code ?? ''] ?? [HttpStatus.INTERNAL_SERVER_ERROR, 'No se pudo completar la operación de base de datos.'];
    host.switchToHttp().getResponse<Response>().status(statusCode).json({ statusCode, message });
  }
}
