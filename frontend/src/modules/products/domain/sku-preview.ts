/**
 * Genera el prefijo alfabético para un SKU a partir del nombre del producto.
 * Este cálculo es puramente de presentación en el frontend.
 * El backend generará el SKU definitivo usando el productoId real.
 */
export function generateSkuPrefix(nombre: string): string {
  const normalized = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ')

  const words = normalized.split(/\s+/).filter(Boolean)

  // Extraer las primeras palabras para análisis tipado seguro
  const [first, second, third] = words

  // Fallback si no hay palabras válidas
  if (!first) return 'PRD'

  // 1 palabra -> primeros 3 chars
  if (!second) {
    return first.slice(0, 3).padEnd(3, 'X')
  }

  // 2 palabras -> 1ª letra de la 1ª, 1ª letra de la 2ª, 3ª letra de la 1ª
  if (!third) {
    const charThree = first.charAt(2) || 'X'
    return `${first.charAt(0)}${second.charAt(0)}${charThree}`
  }

  // 3 o más palabras -> iniciales de las 3 primeras
  return `${first.charAt(0)}${second.charAt(0)}${third.charAt(0)}`
}

/**
 * Genera el string de preview completo que se muestra en la UI.
 * Usa "XXXXXX" como placeholder del ID (el id real se genera en backend).
 */
export function generateSkuPreview(nombre: string): string {
  const prefix = generateSkuPrefix(nombre)
  return `${prefix}-XXXXXX`
}
