import type { PaginatedResult } from './product.models'

export interface CategoryProduct {
  categoriaProductoId: number
  categoriaId: number
  productoId: number
  createdAt: string
  updatedAt: string
}

export type CategoryProductFilters = {
  categoriaId?: number
  productoId?: number
  page?: number
  limit?: number
}

export type PaginatedCategoryProducts = PaginatedResult<CategoryProduct>

export type CreateCategoryProductInput = {
  categoriaId: number
  productoId: number
}
