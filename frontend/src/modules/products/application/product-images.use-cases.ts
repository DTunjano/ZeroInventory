import { productImageRepository } from '../infrastructure/product-image.repository.http'
import type { PaginatedResult, ProductImage } from '../domain/product.models'

export function listImagesByProduct(productoId: number): Promise<PaginatedResult<ProductImage>> {
  return productImageRepository.listByProduct(productoId)
}

export function uploadProductImage(productoId: number, file: File): Promise<ProductImage> {
  return productImageRepository.upload(productoId, file)
}
