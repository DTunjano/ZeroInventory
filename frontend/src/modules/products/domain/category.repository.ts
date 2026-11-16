import type { CategoryFilters, PaginatedCategories } from './category.models'

export interface CategoryRepository {
  list(filters?: CategoryFilters): Promise<PaginatedCategories>
}
