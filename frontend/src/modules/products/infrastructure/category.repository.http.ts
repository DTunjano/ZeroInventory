import { http } from '@/infrastructure/http/http'

import type { CategoryRepository } from '../domain/category.repository'
import type { CategoryFilters, PaginatedCategories } from '../domain/category.models'

export class CategoryHttpRepository implements CategoryRepository {
  async list(filters?: CategoryFilters): Promise<PaginatedCategories> {
    const { data } = await http.get<PaginatedCategories>('/categorias', {
      params: filters,
    })
    return data
  }
}

export const categoryRepository: CategoryRepository = new CategoryHttpRepository()
