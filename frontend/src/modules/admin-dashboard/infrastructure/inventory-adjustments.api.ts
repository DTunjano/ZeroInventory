import { http } from '@/infrastructure/http/http'

import type { PaginatedInventoryAdjustments } from '../domain/admin-dashboard.models'

export type InventoryAdjustmentFilters = {
  page?: number
  limit?: number
  productoId?: number
  usuarioId?: number
  tipoCambio?: 'AUMENTO' | 'REDUCCION'
  search?: string
  startDate?: string
  endDate?: string
}

export class InventoryAdjustmentsApi {
  async getAdjustments(filters: InventoryAdjustmentFilters = {}): Promise<PaginatedInventoryAdjustments> {
    const { data } = await http.get<PaginatedInventoryAdjustments>('/inventory/adjustments', {
      params: filters,
    })
    return data
  }
}

export const inventoryAdjustmentsApi = new InventoryAdjustmentsApi()