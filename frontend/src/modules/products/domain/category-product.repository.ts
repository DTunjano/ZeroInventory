import type {
  CategoryProductFilters,
  CreateCategoryProductInput,
  PaginatedCategoryProducts,
} from './category-product.models'

export interface CategoryProductRepository {
  list(filters?: CategoryProductFilters): Promise<PaginatedCategoryProducts>
  create(input: CreateCategoryProductInput): Promise<void>
  delete(categoriaProductoId: number): Promise<void>
}
