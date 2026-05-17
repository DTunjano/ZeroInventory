import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { Product } from '../../domain/product.models'
import { ProductTableRow } from './ProductTableRow'

export interface ProductTableProps {
  products: Product[]
  imagesByProductId?: Record<number, string>
  categoriesByProductId?: Record<number, string[]>
  providersByProductId?: Record<number, string>
  onEdit: (product: Product) => void
  onToggleActive: (product: Product) => void
  onSoftDelete: (product: Product) => void
  isLoading?: boolean
  
  // Paginación
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

/**
 * ProductTable - Tabla moderna para visualización lista de productos
 * 
 * Domain: Presentation Component
 * Responsabilidad: Renderizar lista de productos en tabla con paginación escalable
 */
export function ProductTable({
  products,
  imagesByProductId = {},
  categoriesByProductId = {},
  providersByProductId = {},
  onEdit,
  onToggleActive,
  onSoftDelete,
  isLoading = false,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: ProductTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  if (!products.length && totalItems === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Imagen</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <td colSpan={7} className="py-12 text-center text-sm text-white/60">
                Sin productos aún
              </td>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabla */}
      <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-12">Imagen</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const imageUrl = imagesByProductId[product.productoId]
              const categoryNames = categoriesByProductId[product.productoId]
              const providerName = providersByProductId[product.productoId]

              return (
                <ProductTableRow
                  key={product.productoId}
                  product={product}
                  {...(imageUrl ? { imageUrl } : {})}
                  {...(categoryNames?.length ? { categoryNames } : {})}
                  {...(providerName ? { providerName } : {})}
                  onEdit={() => onEdit(product)}
                  onToggleActive={() => onToggleActive(product)}
                  onSoftDelete={() => onSoftDelete(product)}
                  isLoading={isLoading}
                />
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="text-sm text-white/60">
            Mostrando {startIndex} a {endIndex} de {totalItems} productos
          </div>

          <div className="flex items-center gap-2">
            {/* Primera página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className="h-8 w-8 p-0"
              title="Primera página"
            >
              ⟨⟨
            </Button>

            {/* Página anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="h-8 w-8 p-0"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Mostrar siempre la primera, última, actual y ±1
                  const distance = Math.abs(page - currentPage)
                  return page === 1 || page === totalPages || distance <= 1
                })
                .map((page, index, array) => {
                  const prevPage = array[index - 1]

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {/* Puntos suspensivos si hay brecha */}
                      {prevPage && page - prevPage > 1 && (
                        <span className="px-2 text-white/40">…</span>
                      )}

                      <Button
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        disabled={isLoading}
                        className="h-8 min-w-8"
                      >
                        {page}
                      </Button>
                    </div>
                  )
                })}
            </div>

            {/* Página siguiente */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="h-8 w-8 p-0"
              title="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Última página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className="h-8 w-8 p-0"
              title="Última página"
            >
              ⟩⟩
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
