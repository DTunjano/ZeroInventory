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
    // Log outgoing filters to help debug category filtering issues
    console.debug('[ProductHttpRepository] list - filters ->', filters)
    const { data } = await http.get<PaginatedResult<Product>>('/productos', {
      params: filters,
    })
    // Convertir precios de string a número si es necesario
    return {
      ...data,
      data: data.data.map((p) => ({
        ...p,
        precio: typeof p.precio === 'string' ? Number(p.precio) : p.precio,
        cantidad: typeof p.cantidad === 'string' ? Number(p.cantidad) : p.cantidad,
      })),
    }
  }

  async getById(productoId: number): Promise<Product> {
    const { data } = await http.get<Product>(`/productos/${productoId}`)
    // Convertir precios de string a número si es necesario
    return {
      ...data,
      precio: typeof data.precio === 'string' ? Number(data.precio) : data.precio,
      cantidad: typeof data.cantidad === 'string' ? Number(data.cantidad) : data.cantidad,
    }
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
