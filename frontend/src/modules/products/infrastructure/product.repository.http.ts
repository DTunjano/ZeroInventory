import { http } from '@/infrastructure/http/http'

import type { ProductRepository } from '../domain/product.repository'
import type {
  CreateProductInput,
  PaginatedResult,
  Product,
  ProductFilters,
  UpdateProductInput,
} from '../domain/product.models'

export class ProductHttpRepository implements ProductRepository {
  async list(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
    const { data } = await http.get<PaginatedResult<Product>>('/productos', {
      params: filters,
    })
    return data
  }

  async getById(productoId: number): Promise<Product> {
    const { data } = await http.get<Product>(`/productos/${productoId}`)
    return data
  }

  async create(input: CreateProductInput): Promise<Product> {
    const { data } = await http.post<Product>('/productos', input)
    return data
  }

  async update(productoId: number, input: UpdateProductInput): Promise<Product> {
    const { data } = await http.put<Product>(`/productos/${productoId}`, input)
    return data
  }

  async delete(productoId: number): Promise<void> {
    await http.delete(`/productos/${productoId}`)
  }
}

export const productRepository: ProductRepository = new ProductHttpRepository()
