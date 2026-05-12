import { paymentApi } from '../infrastructure/payment.api'

export function confirmPayment(pagoId: number) {
  return paymentApi.confirmPayment(pagoId)
}
