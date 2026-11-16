import type { Product } from '@/modules/products/domain/product.models'

/**
 * Objeto de valor: estado de inventario
 * Estados calculados de inventario (NO persistidos)
 */
export type InventoryStatusType =
  | 'OUT_OF_STOCK'
  | 'CRITICAL'
  | 'LOW_STOCK'
  | 'HEALTHY'

export interface InventoryStatus {
  status: InventoryStatusType
  label: string
  color: 'red' | 'yellow' | 'orange' | 'green'
  icon: string
}

/**
 * Producto de inventario - proyección para la vista de inventario
 */
export interface InventoryProduct {
  productoId: number
  nombre: string
  sku: string
  categoria?: string
  stock: number
  estado: InventoryStatusType
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Métricas de inventario calculadas desde el catálogo.
 */
export interface InventoryMetrics {
  totalStock: number
  lowStock: number
  critical: number
  outOfStock: number
}

export type InventorySummary = InventoryMetrics

/**
 * Calcula el estado de inventario según el stock disponible.
 */
export function getInventoryStatus(stock: number): InventoryStatus {
  if (stock === 0) {
    return {
      status: 'OUT_OF_STOCK',
      label: 'Agotado',
      color: 'red',
      icon: '⊘',
    }
  }

  if (stock <= 150) {
    return {
      status: 'CRITICAL',
      label: 'Crítico',
      color: 'red',
      icon: '⚠',
    }
  }

  if (stock < 300) {
    return {
      status: 'LOW_STOCK',
      label: 'Bajo',
      color: 'yellow',
      icon: '◊',
    }
  }

  return {
    status: 'HEALTHY',
    label: 'Saludable',
    color: 'green',
    icon: '✓',
  }
}

/**
 * Compatibilidad con implementación anterior.
 */
export function calculateInventoryStatus(stock: number): InventoryStatusType {
  return getInventoryStatus(stock).status
}

/**
 * Obtiene la metadata del estado de inventario.
 */
export function getInventoryStatusMeta(
  status: InventoryStatusType,
): InventoryStatus {
  const statusMap: Record<InventoryStatusType, InventoryStatus> = {
    OUT_OF_STOCK: getInventoryStatus(0),
    CRITICAL: getInventoryStatus(150),
    LOW_STOCK: getInventoryStatus(200),
    HEALTHY: getInventoryStatus(300),
  }

  return statusMap[status]
}

/**
 * Calcula las métricas del inventario usando una sola fuente de datos.
 */
export function getInventoryMetrics(products: Array<Pick<Product, 'cantidad' | 'isActive'>>): InventoryMetrics {
  const activeProducts = products.filter((product) => product.isActive)

  return {
    totalStock: activeProducts.reduce((sum, product) => sum + product.cantidad, 0),
    lowStock: activeProducts.filter(
      (product) => {
        const status = getInventoryStatus(product.cantidad).status
        return status === 'LOW_STOCK'
      },
    ).length,
    critical: activeProducts.filter(
      (product) => getInventoryStatus(product.cantidad).status === 'CRITICAL',
    ).length,
    outOfStock: activeProducts.filter(
      (product) => getInventoryStatus(product.cantidad).status === 'OUT_OF_STOCK',
    ).length,
  }
}
