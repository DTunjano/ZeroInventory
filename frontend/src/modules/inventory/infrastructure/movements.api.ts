import { http } from '@/infrastructure/http/http'
import type { InventoryMovementPage } from '../domain/movement.models'
export async function listProductMovements(
  id: number,
  page: number,
): Promise<InventoryMovementPage> {
  return (
    await http.get<InventoryMovementPage>(
      `/inventory/products/${id}/movements`,
      { params: { page, limit: 10 } },
    )
  ).data
}
