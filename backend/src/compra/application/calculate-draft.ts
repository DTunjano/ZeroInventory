import { BadRequestException } from '@nestjs/common';
import { amount, cents } from '../../shared/money';
import type {
  CompraDraft,
  CompraDraftInput,
} from '../domain/compra-workflow.types';

export function calculateDraft(input: CompraDraftInput): CompraDraft {
  if (
    !Number.isInteger(input.proveedorId) ||
    input.proveedorId <= 0 ||
    !input.lineas?.length ||
    input.lineas.length > 100
  )
    throw new BadRequestException(
      'Selecciona proveedor y entre 1 y 100 líneas',
    );
  const ids = new Set<number>();
  let total = 0;
  const lineas = input.lineas.map((line) => {
    if (
      !Number.isInteger(line.productoId) ||
      line.productoId <= 0 ||
      ids.has(line.productoId)
    )
      throw new BadRequestException('Cada producto debe aparecer una sola vez');
    ids.add(line.productoId);
    if (
      !Number.isInteger(line.cantidad) ||
      line.cantidad <= 0 ||
      line.cantidad > 2147483647
    )
      throw new BadRequestException(
        'La cantidad debe ser un entero positivo válido',
      );
    const cost = cents(line.costoUnitario);
    if (!cost || !/^\d+(?:\.\d{1,2})?$/.test(String(line.costoUnitario)))
      throw new BadRequestException(
        'El costo debe ser positivo y tener máximo dos decimales',
      );
    const subtotal = amount(cost * line.cantidad);
    total += cost * line.cantidad;
    amount(total);
    return { ...line, subtotal };
  });
  return {
    proveedorId: input.proveedorId,
    ...(input.observaciones?.trim()
      ? { observaciones: input.observaciones.trim() }
      : {}),
    lineas,
    total: amount(total),
  };
}
