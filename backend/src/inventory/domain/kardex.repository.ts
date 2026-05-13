import type { CreateKardexMovementData, KardexMovement } from './inventory.types'

/**
 * Interfaz de repositorio para operaciones de Kárdex
 * Implementa patrón Repository del DDD
 */
export interface IKardexRepository {
  /**
   * Crea un movimiento en el Kárdex
   * @param data Datos del movimiento
   * @returns El movimiento creado
   */
  createMovement(data: CreateKardexMovementData): Promise<KardexMovement>

  /**
   * Obtiene movimientos de un producto
   * @param productoId ID del producto
   * @param limit Límite de resultados
   * @returns Lista de movimientos
   */
  getMovementsByProduct(productoId: number, limit?: number): Promise<KardexMovement[]>

  /**
   * Obtiene el saldo total de un producto desde el Kárdex
   * Cálculo: ENTRADA - SALIDA
   * @param productoId ID del producto
   * @returns Cantidad disponible en Kárdex
   */
  getProductStockBalance(productoId: number): Promise<number>
}
