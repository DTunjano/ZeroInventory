import { useQuery } from '@tanstack/react-query'
import { listProductMovements } from '../infrastructure/movements.api'
export function useProductMovements(id: number, page: number) {
  return useQuery({
    queryKey: ['inventory-movements', id, page],
    queryFn: () => listProductMovements(id, page),
  })
}
