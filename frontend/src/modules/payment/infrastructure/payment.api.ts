import { http } from '@/infrastructure/http/http'

export class PaymentHttpApi {
  async confirmPayment(pagoId: number): Promise<{ success: boolean }> {
    const { data } = await http.post<{ success: boolean }>(`/pagos/${pagoId}/confirm`, {})
    return data
  }
}

export const paymentApi = new PaymentHttpApi()
