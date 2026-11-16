import type { QueryClient } from '@tanstack/react-query'
const keys = new Set([
  'products',
  'store-products',
  'inventory-products',
  'inventory-summary',
  'inventory-movements',
  'inventory-adjustments',
  'admin-dashboard',
  'cart',
  'reports',
  'proveedores',
  'providers',
])
export function invalidateInventory(client: QueryClient) {
  return client.invalidateQueries({
    predicate: (query) => keys.has(String(query.queryKey[0])),
  })
}
