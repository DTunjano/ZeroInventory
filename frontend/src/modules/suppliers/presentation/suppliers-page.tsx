import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building, Plus, Search, RotateCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { usePermissions } from '@/shared/hooks/usePermissions'
import {
  useSuppliers,
  useToggleSupplierStatus,
} from '@/modules/suppliers/application/hooks/useSuppliers'
import { SupplierCard } from '@/modules/suppliers/components/supplier-card'
import { SupplierFormModal } from '@/modules/suppliers/components/supplier-form-modal'
import { supplierService } from '../application/supplier.service'
import type { Proveedor } from '../domain/supplier.entity'

import { useDebounce } from '@/shared/hooks/useDebounce'

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

export function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Proveedor | null>(null)
  const [statusModalSupplier, setStatusModalSupplier] = useState<Proveedor | null>(null)
  const [deleteModalSupplier, setDeleteModalSupplier] = useState<Proveedor | null>(null)
  const { canCreate } = usePermissions()

  const isActive =
    statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE' ? true : false

  const listParams = {
    page: 1,
    limit: 60,
    ...(debouncedSearch ? { nombre: debouncedSearch } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  }

  const { data, isLoading } = useSuppliers(listParams)
  const toggleMutation = useToggleSupplierStatus()
  const qc = useQueryClient()

  const filteredSuppliers =
    data?.data?.filter((prov) => {
      if (!debouncedSearch) return true
      const q = debouncedSearch.toLowerCase()
      return (
        prov.nombre.toLowerCase().includes(q) ||
        (prov.nombreTitular?.toLowerCase().includes(q) ?? false) ||
        (prov.email?.toLowerCase().includes(q) ?? false)
      )
    }) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Gestion de Proveedores
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {data?.total ?? 0} proveedores registrados
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => {
              setEditingSupplier(null)
              setCreateModalOpen(true)
            }}
            className="gap-2 rounded-xl bg-blue-600 px-5 py-2 text-base font-semibold hover:bg-blue-500"
          >
            <Plus className="h-5 w-5" />
            Agregar proveedor
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-xl border-border bg-card pl-10 text-lg text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            {(
              [
                ['Todos', 'ALL'],
                ['Activos', 'ACTIVE'],
                ['Inactivos', 'INACTIVE'],
              ] as const
            ).map(([label, value]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === value
                    ? 'bg-blue-500 text-white'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <Button
            onClick={() => qc.invalidateQueries({ queryKey: ['proveedores'] })}
            variant="outline"
            className="gap-2 rounded-xl border-border px-4 py-2 text-base font-semibold hover:bg-muted/50"
            disabled={isLoading}
          >
            <RotateCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <SupplierFormModal
        open={createModalOpen || !!editingSupplier}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false)
            setEditingSupplier(null)
          } else {
            setCreateModalOpen(true)
          }
        }}
        proveedor={editingSupplier ?? null}
      />

      <ConfirmModal
        open={!!statusModalSupplier}
        onOpenChange={(open) => {
          if (!open) setStatusModalSupplier(null)
        }}
        title={
          statusModalSupplier?.isActive
            ? 'Desactivar proveedor'
            : 'Activar proveedor'
        }
        description={
          statusModalSupplier
            ? `Deseas ${
                statusModalSupplier.isActive ? 'desactivar' : 'activar'
              } a ${statusModalSupplier.nombre}?`
            : undefined
        }
        confirmText={
          statusModalSupplier?.isActive ? 'Desactivar' : 'Activar'
        }
        confirmVariant={
          statusModalSupplier?.isActive ? 'destructive' : 'default'
        }
        onConfirm={() => {
          if (!statusModalSupplier) return
          toggleMutation.mutate(statusModalSupplier.proveedorId)
          setStatusModalSupplier(null)
        }}
        isConfirming={toggleMutation.isPending}
      />

      <ConfirmModal
        open={!!deleteModalSupplier}
        onOpenChange={(open) => {
          if (!open) setDeleteModalSupplier(null)
        }}
        title="Eliminar proveedor"
        description={
          deleteModalSupplier
            ? `Se desactivará a ${deleteModalSupplier.nombre} conservando su historial. ¿Deseas continuar?`
            : undefined
        }
        confirmText="Eliminar"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deleteModalSupplier) return
          supplierService
            .update(deleteModalSupplier.proveedorId, { isActive: false })
            .then(() => {
              toast.success('Proveedor desactivado')
              void qc.invalidateQueries({ queryKey: ['proveedores'] })
            })
            .catch((err: any) => toast.error(getApiErrorMessage(err, 'Error')))
          setDeleteModalSupplier(null)
        }}
        isConfirming={toggleMutation.isPending}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Cargando proveedores...
        </div>
      ) : filteredSuppliers.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((prov) => (
            <SupplierCard
              key={prov.proveedorId}
              proveedor={prov}
              onEdit={(id) => {
                const target = filteredSuppliers.find((p) => p.proveedorId === id)
                if (target) setEditingSupplier(target)
              }}
              onToggleStatus={(id) => {
                const target = filteredSuppliers.find((p) => p.proveedorId === id)
                if (target) setStatusModalSupplier(target)
              }}
              onDelete={(id) => {
                const target = filteredSuppliers.find((p) => p.proveedorId === id)
                if (target) setDeleteModalSupplier(target)
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
            <Building className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base text-muted-foreground">
            {searchTerm
              ? 'No hay proveedores que coincidan con tu busqueda.'
              : 'Sin proveedores registrados.'}
          </p>
        </div>
      )}
    </div>
  )
}
