import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores.
 * Útil para inputs de búsqueda que disparan peticiones a la API.
 * @param value - Valor a debouncear
 * @param delay - Tiempo de espera en ms (default: 300)
 * @returns Valor debounceado
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
