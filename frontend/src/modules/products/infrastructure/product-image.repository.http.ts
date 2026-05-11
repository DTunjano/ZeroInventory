import { http } from '@/infrastructure/http/http'

import type { ProductImageRepository } from '../domain/product-image.repository'
import type { PaginatedResult, ProductImage } from '../domain/product.models'

export class ProductImageHttpRepository implements ProductImageRepository {
  async listByProduct(productoId: number): Promise<PaginatedResult<ProductImage>> {
    const { data } = await http.get<PaginatedResult<ProductImage>>(
      '/producto-imagenes',
      { params: { productoId, page: 1, limit: 10 } },
    )
    return data
  }

  async upload(productoId: number, file: File): Promise<ProductImage> {
    const form = new FormData()
    form.append('productoId', String(productoId))
    form.append('imagen', file)

    const { data } = await http.post<ProductImage>('/producto-imagenes', form)
    return data
  }

  async delete(imagenProductoId: number): Promise<void> {
    await http.delete(`/producto-imagenes/${imagenProductoId}`)
  }
}

export const productImageRepository: ProductImageRepository =
  new ProductImageHttpRepository()
