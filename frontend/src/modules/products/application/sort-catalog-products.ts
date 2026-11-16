import type { Product } from '../domain/product.models'

export function sortCatalogProducts<T extends Pick<Product, 'nombre' | 'cantidad'>>(
  products: readonly T[], sortBy: 'stock' | 'nombre' | undefined, order: 'asc' | 'desc',
): T[] {
  const priority = (quantity: number) => quantity <= 0 ? 2 : quantity <= 150 ? 1 : 0
  return [...products].sort((a, b) => {
    if (sortBy === 'stock') return order === 'asc' ? a.cantidad - b.cantidad : b.cantidad - a.cantidad
    if (sortBy === 'nombre') return order === 'asc' ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre)
    return priority(a.cantidad) - priority(b.cantidad)
  })
}
