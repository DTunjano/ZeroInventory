import { categoryProductRepository } from '../infrastructure/category-product.repository.http'

export async function listProductCategoryIds(productoId: number): Promise<number[]> {
  const res = await categoryProductRepository.list({ productoId, page: 1, limit: 100 })
  return res.data.map((x) => x.categoriaId)
}
