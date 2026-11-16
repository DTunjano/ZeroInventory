export type WompiStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';
export interface WompiTransaction {
  id: string;
  reference: string;
  amountInCents: number;
  currency: 'COP';
  status: WompiStatus;
}
export interface WompiCheckout {
  pedidoId: number;
  pagoId: number;
  reference: string;
  amountInCents: number;
}
export abstract class WompiGateway {
  abstract transaction(id: string): Promise<WompiTransaction>;
}
export abstract class WompiRepository {
  abstract checkout(orderId: number, userId: number): Promise<WompiCheckout>;
  abstract authorize(orderId: number, userId: number): Promise<void>;
  abstract findReference(
    reference: string,
  ): Promise<{ pedidoId: number } | null>;
  abstract apply(
    transaction: WompiTransaction,
    orderId: number,
  ): Promise<{ pedidoId: number; estado: string; paymentStatus: string }>;
}
