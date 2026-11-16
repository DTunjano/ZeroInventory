/**
 * Trunca un texto a un número máximo de caracteres
 * Si el texto es más largo, agrega "..."
 * 
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado con "..." si fue necesario
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  return `${text.substring(0, maxLength - 3)}...`
}

/**
 * Trunca un texto manteniendo palabras completas (no corta a mitad de palabra)
 * 
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima (aproximada)
 * @returns Texto truncado manteniendo palabras completas
 */
export function truncateTextByWords(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text
  }

  const words = text.split(' ')
  let result = ''

  for (const word of words) {
    const testString = result ? `${result} ${word}` : word
    if (testString.length <= maxLength) {
      result = testString
    } else {
      break
    }
  }

  return result.length === text.length ? text : `${result}...`
}
