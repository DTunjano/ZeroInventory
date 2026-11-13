export interface AdminDashboardSummary {
  totalPedidos: number
  totalIngresos: number
  totalProductos: number
  totalUsuarios: number
  totalMovimientosInventario: number
  totalProductosVendidos: number
  pedidosCompletados: number
  productosBajoStock: number
}

export interface MonthlySeriesPoint {
  period: string
  value: number
}

export interface InventoryMovementPoint {
  period: string
  entradas: number
  salidas: number
}

export interface TopProductPoint {
  productId: number
  name: string
  soldQuantity: number
  revenue: number
}

export interface RecentOrderPoint {
  orderId: number
  customerName: string
  username: string
  total: number
  itemsCount: number
  state: string
  paymentStatus: string
  paymentMethod: string
  date: string
}

export interface RecentActivityPoint {
  movementId: number
  productName: string
  typeMovement: string
  quantity: number
  referenceId: number
  date: string
}

export interface InventoryAdjustmentPoint {
  ajusteInventarioId: number
  productoId: number
  productoNombre: string
  productoSku: string
  usuarioId: number
  usuarioNombre: string
  userRole?: string | null
  stockAnterior: number
  stockNuevo: number
  cantidad: number
  tipoCambio: 'AUMENTO' | 'REDUCCION'
  motivo: string
  fecha: string
}

export interface PaginatedInventoryAdjustments {
  data: InventoryAdjustmentPoint[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminDashboardResponse {
  summary: AdminDashboardSummary
  revenueOverview: MonthlySeriesPoint[]
  orderVolume: MonthlySeriesPoint[]
  inventoryMovements: InventoryMovementPoint[]
  topProducts: TopProductPoint[]
  recentOrders: RecentOrderPoint[]
  recentActivity: RecentActivityPoint[]
}