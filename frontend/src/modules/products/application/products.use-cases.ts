import { productRepository } from '../infrastructure/product.repository.http'
import type {
  CreateProductInput,
  Product,
  ProductFilters,
  UpdateProductInput,
  PaginatedResult,
} from '../domain/product.models'

export function listProducts(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
  return productRepository.list(filters)
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return productRepository.create(input)
}

export function updateProduct(productoId: number, input: UpdateProductInput): Promise<Product> {
  return productRepository.update(productoId, input)
}

export function deleteProduct(productoId: number): Promise<void> {
  return productRepository.delete(productoId)
}
