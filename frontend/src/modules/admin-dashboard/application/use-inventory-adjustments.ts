import { useQuery } from '@tanstack/react-query'

import { inventoryAdjustmentsApi, type InventoryAdjustmentFilters } from '../infrastructure/inventory-adjustments.api'

const INVENTORY_ADJUSTMENTS_KEY = ['inventory-adjustments'] as const

export function useInventoryAdjustments(filters: InventoryAdjustmentFilters) {
  return useQuery({
    queryKey: [...INVENTORY_ADJUSTMENTS_KEY, filters],
    queryFn: () => inventoryAdjustmentsApi.getAdjustments(filters),
    staleTime: 60_000,
  })
}