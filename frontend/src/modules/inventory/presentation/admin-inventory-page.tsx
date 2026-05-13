import { useState } from 'react'
import { useInventory } from '../application/use-inventory'
import type { InventoryStatusType } from '../domain/inventory.models'
import { StatCard } from '../components/stat-card'
import { InventoryTable } from '../components/inventory-table'
import { InventoryFilterBar } from '../components/inventory-filter-bar'

export function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatusType>('ALL')
  const [isActiveFilter, setIsActiveFilter] = useState<'ALL' | boolean>('ALL')

  const { products, metrics, isLoading, isFetching } = useInventory()

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm.trim() ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase().trim())

    const matchesActive =
      isActiveFilter === 'ALL' ? true : p.isActive === isActiveFilter

    if (!matchesSearch || !matchesActive) return false

    if (statusFilter !== 'ALL' && p.estado !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Inventario</h1>
        <p className="mt-2 text-lg text-zinc-300">
          Visualización analítica y gestión del stock
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="total"
          label="Stock total"
          value={metrics.totalStock}
          description="En todos los productos"
          isLoading={isLoading}
        />
        <StatCard
          variant="low"
          label="Stock bajo"
          value={metrics.lowStock}
          description="Requiere atención"
          isLoading={isLoading}
        />
        <StatCard
          variant="critical"
          label="Crítico"
          value={metrics.critical}
          description="Reposición urgente"
          isLoading={isLoading}
        />
        <StatCard
          variant="out"
          label="Agotado"
          value={metrics.outOfStock}
          description="No disponible"
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <InventoryFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        isActiveFilter={isActiveFilter}
        onIsActiveChange={setIsActiveFilter}
      />

      {/* Table */}
      <InventoryTable
        products={filteredProducts}
        isLoading={isLoading || isFetching}
        isEmpty={filteredProducts.length === 0}
      />
    </div>
  )
}
