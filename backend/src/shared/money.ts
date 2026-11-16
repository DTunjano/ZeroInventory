import { BadRequestException } from '@nestjs/common';

export function cents(value: number): number {
  const result = Math.round(Number(value) * 100);
  if (!Number.isFinite(Number(value)) || !Number.isSafeInteger(result) || result < 0 || result > 99999999999999) {
    throw new BadRequestException('El importe excede el rango monetario permitido');
  }
  return result;
}

export function amount(valueInCents: number): number {
  if (!Number.isSafeInteger(valueInCents) || valueInCents < 0 || valueInCents > 99999999999999) {
    throw new BadRequestException('El total excede el rango monetario permitido');
  }
  return valueInCents / 100;
}
