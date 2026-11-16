import { categoryProductRepository } from '../infrastructure/category-product.repository.http'

export async function listCategoryIdsByProductIds(
  productoIds: number[],
): Promise<Record<number, number[]>> {
  const uniqueIds = Array.from(new Set(productoIds)).filter((id) => id > 0)
  if (!uniqueIds.length) return {}

  const results = await Promise.all(
    uniqueIds.map(async (productoId) => {
      const res = await categoryProductRepository.list({
        productoId,
        page: 1,
        limit: 100,
      })
      return [productoId, res.data.map((x) => x.categoriaId)] as const
    }),
  )

  return Object.fromEntries(results)
}
