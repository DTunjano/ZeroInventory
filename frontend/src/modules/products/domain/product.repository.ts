import type {
  CreateProductInput,
  PaginatedResult,
  Product,
  ProductFilters,
  UpdateProductInput,
} from './product.models'

export interface ProductRepository {
  list(filters?: ProductFilters): Promise<PaginatedResult<Product>>
  getById(productoId: number): Promise<Product>
  create(input: CreateProductInput): Promise<Product>
  update(productoId: number, input: UpdateProductInput): Promise<Product>
  delete(productoId: number): Promise<void>
}
