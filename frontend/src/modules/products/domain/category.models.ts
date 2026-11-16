import type { PaginatedResult } from './product.models'

export interface Category {
  categoriaId: number
  nombre: string
}

export type CategoryFilters = {
  nombre?: string
  page?: number
  limit?: number
}

export type PaginatedCategories = PaginatedResult<Category>
