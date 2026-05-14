import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminDashboardApi } from '../infrastructure/admin-dashboard.api'
import type {
  CreateKardexMovementInput,
  RegisterStockAdjustmentInput,
} from '../domain/inventory-management.models'

const ADMIN_DASHBOARD_KEY = ['admin-dashboard'] as const
const INVENTORY_PRODUCTS_KEY = ['inventory-products'] as const
const INVENTORY_SUMMARY_KEY = ['inventory-summary'] as const
const PRODUCTS_KEY = ['products'] as const

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
      queryClient.invalidateQueries({ queryKey: INVENTORY_PRODUCTS_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_SUMMARY_KEY })
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
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
      queryClient.invalidateQueries({ queryKey: INVENTORY_PRODUCTS_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_SUMMARY_KEY })
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}
