import { http } from '@/infrastructure/http/http'

import type { AdminDashboardResponse } from '../domain/admin-dashboard.models'
import type {
  RegisterStockAdjustmentInput,
  StockAdjustmentResponse,
  StockValidationResponse,
} from '../domain/inventory-management.models'

export class AdminDashboardApi {
  async getDashboard(): Promise<AdminDashboardResponse> {
    const { data } = await http.get<AdminDashboardResponse>('/admin/dashboard')
    return data
  }

  async validateStock(productoId: number, cantidad: number): Promise<StockValidationResponse> {
    const { data } = await http.get<StockValidationResponse>(`/inventory/stock/validate/${productoId}/${cantidad}`)
    return data
  }

  async registerStockAdjustment(payload: RegisterStockAdjustmentInput): Promise<StockAdjustmentResponse> {
    const { data } = await http.post<StockAdjustmentResponse>('/inventory/adjustments', payload)
    return data
  }


}

export const adminDashboardApi = new AdminDashboardApi()