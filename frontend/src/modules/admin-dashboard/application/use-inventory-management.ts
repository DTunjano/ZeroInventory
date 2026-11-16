import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateInventory } from '@/modules/inventory/application/invalidate-inventory'
import { adminDashboardApi } from '../infrastructure/admin-dashboard.api'
import type {
  RegisterStockAdjustmentInput,
} from '../domain/inventory-management.models'

export function useValidateStockMutation() {
  return useMutation({
    mutationFn: ({ productoId, cantidad }: { productoId: number; cantidad: number }) =>
      adminDashboardApi.validateStock(productoId, cantidad),
  })
}

export function useRegisterStockAdjustmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterStockAdjustmentInput) =>
      adminDashboardApi.registerStockAdjustment(payload),
    onSuccess: () => invalidateInventory(queryClient),
  })
}
