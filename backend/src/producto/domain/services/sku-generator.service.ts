/**
 * Servicio de dominio para la generación del código SKU.
 * Separado en una clase pura para facilitar pruebas unitarias y reuso.
 */
export class SkuGeneratorService {
  /**
   * Genera el prefijo alfatigráfico a partir del nombre del producto.
   *
   * Reglas:
   * - Normaliza el nombre (mayúsculas, sin acentos, sin caracteres especiales).
   * - 1 palabra  → primeras 3 letras.
   * - 2 palabras → 1ª letra pal-1, 1ª letra pal-2, 3ª letra pal-1.
   * - ≥3 palabras → iniciales de cada palabra (hasta 3).
   */
  static generatePrefix(nombre: string): string {
    const normalized = this.normalizeName(nombre)
    const words = normalized.split(/\s+/).filter(Boolean)

    if (words.length === 0) return 'PRD'

    if (words.length === 1) {
      return words[0].slice(0, 3).padEnd(3, 'X')
    }

    if (words.length === 2) {
      const [w1, w2] = words
      return `${w1.charAt(0)}${w2.charAt(0)}${w1.charAt(2) ?? 'X'}`
    }

    // 3 o más palabras → iniciales
    return words
      .slice(0, 3)
      .map((w) => w.charAt(0))
      .join('')
  }

  /**
   * Genera el SKU completo a partir del nombre y el id del producto.
   * Formato: [PREFIJO]-[ID_PADDED]
   */
  static generate(nombre: string, productoId: number): string {
    const prefix = this.generatePrefix(nombre)
    const idPadded = String(productoId).padStart(6, '0')
    return `${prefix}-${idPadded}`
  }

  /**
   * Normaliza el nombre del producto para extraer palabras limpias.
   */
  private static normalizeName(nombre: string): string {
    return nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
  }
}
