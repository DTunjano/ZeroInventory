import { BadRequestException } from '@nestjs/common';

/** Report sums may exceed a single numeric(14,2) row, but must retain cent precision. */
export function reportAmount(value: string | number): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));
  if (!match) throw new BadRequestException('Importe agregado inválido');
  const units = BigInt(match[1]) * 100n + BigInt((match[2] ?? '').padEnd(2, '0'));
  if (units > BigInt(Number.MAX_SAFE_INTEGER)) throw new BadRequestException('El reporte excede el rango monetario representable; reduce el período');
  return Number(units) / 100;
}
