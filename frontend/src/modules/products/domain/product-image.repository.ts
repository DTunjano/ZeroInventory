import type { PaginatedResult, ProductImage } from './product.models'

export interface ProductImageRepository {
  listByProduct(productoId: number): Promise<PaginatedResult<ProductImage>>
  upload(productoId: number, file: File): Promise<ProductImage>
  update(imagenProductoId: number, file: File): Promise<ProductImage>
  delete(imagenProductoId: number): Promise<void>
}
