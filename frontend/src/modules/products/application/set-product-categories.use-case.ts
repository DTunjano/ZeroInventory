import { categoryProductRepository } from '../infrastructure/category-product.repository.http'

export async function setProductCategories(params: {
  productoId: number
  categoriaIds: number[]
}): Promise<void> {
  const { productoId, categoriaIds } = params

  const uniqueCategoriaIds = Array.from(new Set(categoriaIds))

  const existing = await categoryProductRepository.list({
    productoId,
    page: 1,
    limit: 100,
  })

  const existingCategoriaIds = new Set(existing.data.map((x) => x.categoriaId))

  const toDelete = existing.data.filter(
    (x) => !uniqueCategoriaIds.includes(x.categoriaId),
  )
  const toAdd = uniqueCategoriaIds.filter((id) => !existingCategoriaIds.has(id))

  await Promise.all(toDelete.map((x) => categoryProductRepository.delete(x.categoriaProductoId)))
  await Promise.all(
    toAdd.map((categoriaId) =>
      categoryProductRepository.create({ productoId, categoriaId }),
    ),
  )
}
