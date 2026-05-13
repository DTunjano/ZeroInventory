import type { PaginatedResult } from '@/modules/products/domain/product.models'
import { listProducts } from '@/modules/products/application/products.use-cases'
import { listCategories } from '@/modules/products/application/list-categories.use-case'
import { listCategoryIdsByProductIds } from '@/modules/products/application/list-category-products-by-product.use-case'
import type {
  InventoryProduct,
  InventoryMetrics,
  InventorySummary,
} from '../domain/inventory.models'
import {
  calculateInventoryStatus,
  getInventoryMetrics,
  getInventoryStatusMeta,
} from '../domain/inventory.models'

async function getCategoryNameByProductId(
  productIds: number[],
): Promise<Record<number, string[]>> {
  try {
    const uniqueIds = Array.from(new Set(productIds)).filter((id) => id > 0)
    if (!uniqueIds.length) return {}

    const [categories, categoryIdsByProductId] = await Promise.all([
      listCategories({ page: 1, limit: 100 }),
      listCategoryIdsByProductIds(uniqueIds),
    ])

    const categoryNameById = new Map(
      categories.map((category) => [category.categoriaId, category.nombre]),
    )

    return Object.fromEntries(
      uniqueIds.map((productId) => {
        const categoryNames = (categoryIdsByProductId[productId] ?? [])
          .map((categoryId) => categoryNameById.get(categoryId))
          .filter((value): value is string => Boolean(value))

        return [productId, categoryNames]
      }),
    )
  } catch {
    return {}
  }
}

/**
 * Adaptador de Producto a producto de inventario.
 */
function adaptProductToInventory(
  product: any,
  categoryName?: string,
): InventoryProduct {
  const stock = product.cantidad ?? 0
  const estado = calculateInventoryStatus(stock)

  const fallbackCategoryName =
    typeof product.categoria === 'string'
      ? product.categoria
      : product.categoria?.nombre ?? 'Sin categoría'

  return {
    productoId: product.productoId,
    nombre: product.nombre,
    sku: product.sku,
    categoria: categoryName ?? fallbackCategoryName,
    stock,
    estado,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export const inventoryService = {
  /**
   * Obtiene la lista de productos para el inventario.
   */
  async listInventoryProducts(params: {
    page?: number
    limit?: number
    nombre?: string
    sku?: string
    isActive?: boolean
  } = {}): Promise<PaginatedResult<InventoryProduct>> {
    const productFilters = {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      ...(params.nombre ? { nombre: params.nombre } : {}),
      ...(params.sku ? { sku: params.sku } : {}),
    }

    const result = await listProducts(productFilters)

    const categoryNamesByProductId = await getCategoryNameByProductId(
      result.data.map((product) => product.productoId),
    )

    const inventoryProducts = result.data
      .map((product) => {
        const categoryNames = categoryNamesByProductId[product.productoId] ?? []

        return adaptProductToInventory(
          product,
          categoryNames.length > 0 ? categoryNames.join(', ') : undefined,
        )
      })
      .filter((p) => (params.isActive !== undefined ? p.isActive === params.isActive : true))

    return {
      ...result,
      data: inventoryProducts,
    }
  },

  /**
   * Calcula el resumen del inventario.
   */
  async getInventorySummary(): Promise<InventorySummary> {
    const result = await listProducts({
      page: 1,
      limit: 100,
    })

    return getInventoryMetrics(result.data)
  },

  /**
   * Utilidad: obtiene la metadata del estado.
   */
  getStatusMeta: getInventoryStatusMeta,
}
