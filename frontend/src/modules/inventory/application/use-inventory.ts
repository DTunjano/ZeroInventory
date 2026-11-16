import { useQuery } from '@tanstack/react-query'
import { inventoryService } from '../infrastructure/inventory.service'
import { getInventoryMetrics } from '../domain/inventory.models'

const INVENTORY_PRODUCTS_KEY = 'inventory-products'
const INVENTORY_SUMMARY_KEY = 'inventory-summary'

export function useInventoryProducts(params: {
  page?: number
  limit?: number
  nombre?: string
  sku?: string
  isActive?: boolean
} = {}) {
  const queryKey = [INVENTORY_PRODUCTS_KEY, params]
  
  return useQuery({
    queryKey,
    queryFn: () => inventoryService.listInventoryProducts(params),
  })
}

export function useInventorySummary() {
  return useQuery({
    queryKey: [INVENTORY_SUMMARY_KEY],
    queryFn: () => inventoryService.getInventorySummary(),
    staleTime: 1000 * 60 * 5, // Cache 5 minutos
  })
}

export function useInventory() {
  const productsQuery = useInventoryProducts({ limit: 100 })
  const products = productsQuery.data?.data ?? []
  const metrics = getInventoryMetrics(
    products.map((product) => ({
      cantidad: product.stock,
      isActive: product.isActive,
    })),
  )

  return {
    ...productsQuery,
    products,
    metrics,
  }
}
