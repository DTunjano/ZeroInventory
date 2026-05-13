import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminDashboardApi } from '../infrastructure/admin-dashboard.api'
import type {
  CreateKardexMovementInput,
  RegisterStockAdjustmentInput,
} from '../domain/inventory-management.models'

const ADMIN_DASHBOARD_KEY = ['admin-dashboard'] as const

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_KEY })
    },
  })
}

export function useCreateKardexMovementMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateKardexMovementInput) =>
      adminDashboardApi.createKardexMovement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_KEY })
    },
  })
}
