import { createHash, timingSafeEqual } from 'node:crypto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { WompiTransaction, WompiStatus } from '../domain/wompi.types';

const statuses: WompiStatus[] = [
  'PENDING',
  'APPROVED',
  'DECLINED',
  'VOIDED',
  'ERROR',
];
export function transactionId(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(value))
    throw new BadRequestException('Identificador de transacción inválido');
  return value;
}
export function transactionData(value: unknown): WompiTransaction {
  if (!value || typeof value !== 'object')
    throw new BadRequestException('Transacción incompleta');
  const row = value as Record<string, unknown>;
  if (
    typeof row.reference !== 'string' ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(row.reference) ||
    typeof row.amount_in_cents !== 'number' ||
    !Number.isSafeInteger(row.amount_in_cents) ||
    row.amount_in_cents <= 0 ||
    row.currency !== 'COP' ||
    !statuses.includes(row.status as WompiStatus)
  )
    throw new BadRequestException('Transacción incompatible');
  return {
    id: transactionId(row.id),
    reference: row.reference,
    amountInCents: row.amount_in_cents,
    currency: 'COP',
    status: row.status as WompiStatus,
  };
}
export const integrity = (reference: string, amount: number, secret: string) =>
  createHash('sha256')
    .update(`${reference}${amount}COP${secret}`)
    .digest('hex');

export function verifiedEvent(
  value: unknown,
  secret: string,
): WompiTransaction {
  if (!value || typeof value !== 'object')
    throw new UnauthorizedException('Evento Wompi inválido');
  const event = value as Record<string, unknown>;
  if (
    event.event !== 'transaction.updated' ||
    event.environment !== 'test' ||
    !Number.isSafeInteger(event.timestamp) ||
    Number(event.timestamp) <= 0
  )
    throw new UnauthorizedException('Evento Wompi inválido');
  const signature = event.signature as
    | { properties?: unknown; checksum?: unknown }
    | undefined;
  if (
    !Array.isArray(signature?.properties) ||
    !signature.properties.length ||
    signature.properties.length > 20 ||
    typeof signature.checksum !== 'string' ||
    !/^[a-fA-F0-9]{64}$/.test(signature.checksum)
  )
    throw new UnauthorizedException('Firma Wompi inválida');
  const values: string[] = [];
  for (const property of signature.properties as unknown[]) {
    if (
      typeof property !== 'string' ||
      !/^transaction(?:\.[a-zA-Z0-9_]+){1,5}$/.test(property) ||
      property.length > 150
    )
      throw new UnauthorizedException('Propiedad de firma inválida');
    let current: unknown = event.data;
    for (const segment of property.split('.')) {
      if (
        ['__proto__', 'prototype', 'constructor'].includes(segment) ||
        !current ||
        typeof current !== 'object' ||
        !Object.hasOwn(current, segment)
      )
        throw new UnauthorizedException('Propiedad de firma inválida');
      current = (current as Record<string, unknown>)[segment];
    }
    if (
      (typeof current !== 'string' && typeof current !== 'number') ||
      String(current).length > 1000
    )
      throw new UnauthorizedException('Valor de firma inválido');
    values.push(String(current));
  }
  const expected = createHash('sha256')
    .update(`${values.join('')}${String(event.timestamp)}${secret}`)
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(signature.checksum, 'hex')))
    throw new UnauthorizedException('Firma Wompi inválida');
  return transactionData(
    (event.data as Record<string, unknown> | undefined)?.transaction,
  );
}
