import { http } from '@/infrastructure/http/http'

import type { CategoryProductRepository } from '../domain/category-product.repository'
import type {
  CategoryProductFilters,
  CreateCategoryProductInput,
  PaginatedCategoryProducts,
} from '../domain/category-product.models'

export class CategoryProductHttpRepository implements CategoryProductRepository {
  async list(filters?: CategoryProductFilters): Promise<PaginatedCategoryProducts> {
    const { data } = await http.get<PaginatedCategoryProducts>(
      '/categoria-productos',
      { params: filters },
    )
    return data
  }

  async create(input: CreateCategoryProductInput): Promise<void> {
    await http.post('/categoria-productos', input)
  }

  async delete(categoriaProductoId: number): Promise<void> {
    await http.delete(`/categoria-productos/${categoriaProductoId}`)
  }
}

export const categoryProductRepository: CategoryProductRepository =
  new CategoryProductHttpRepository()
