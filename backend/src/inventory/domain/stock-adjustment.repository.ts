import type { RegisterStockAdjustmentData, StockAdjustment } from './inventory.types'

/**
 * Interfaz de repositorio para ajustes de inventario
 * Maneja auditoría completa de cambios de stock
 */
export interface IStockAdjustmentRepository {
  /**
   * Registra un ajuste de inventario
   * @param data Datos del ajuste (incluye stock_anterior y stock_nuevo)
   * @returns El ajuste registrado
   */
  registerAdjustment(data: RegisterStockAdjustmentData): Promise<StockAdjustment>

  /**
   * Obtiene ajustes de un producto
   * @param productoId ID del producto
   * @param limit Límite de resultados
   * @returns Lista de ajustes ordenados por fecha descendente
   */
  getAdjustmentsByProduct(productoId: number, limit?: number): Promise<StockAdjustment[]>

  /**
   * Obtiene ajustes realizados por un usuario
   * @param usuarioId ID del usuario
   * @param limit Límite de resultados
   * @returns Lista de ajustes ordenados por fecha descendente
   */
  getAdjustmentsByUser(usuarioId: number, limit?: number): Promise<StockAdjustment[]>
}
