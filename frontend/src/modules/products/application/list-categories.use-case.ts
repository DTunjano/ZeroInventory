import type { Category, CategoryFilters } from '../domain/category.models'
import { categoryRepository } from '../infrastructure/category.repository.http'

export async function listCategories(
  filters: CategoryFilters = { page: 1, limit: 100 },
): Promise<Category[]> {
  const res = await categoryRepository.list(filters)
  return res.data
}
