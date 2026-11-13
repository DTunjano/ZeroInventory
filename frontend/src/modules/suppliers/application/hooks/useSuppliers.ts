import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { supplierService } from '../supplier.service'
import type { FiltersProveedorDTO } from '../supplier.service'

const SUPPLIERS_QUERY_KEY = 'proveedores'

export function useSuppliers(filters: FiltersProveedorDTO = {}) {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, filters],
    queryFn: () => supplierService.getAll(filters),
  })
}

export function useSupplier(proveedorId: number) {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, proveedorId],
    queryFn: () => supplierService.getById(proveedorId),
    enabled: !!proveedorId,
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: supplierService.create.bind(supplierService),
    onSuccess: () => {
      toast.success('Proveedor creado exitosamente')
      void qc.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] })
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Error al crear proveedor')),
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ proveedorId, payload }: { proveedorId: number; payload: any }) =>
      supplierService.update(proveedorId, payload),
    onSuccess: () => {
      toast.success('Proveedor actualizado exitosamente')
      void qc.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] })
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Error al actualizar proveedor')),
  })
}

export function useToggleSupplierStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (proveedorId: number) => supplierService.toggleStatus(proveedorId),
    onSuccess: () => {
      toast.success('Estado del proveedor actualizado')
      void qc.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] })
      void qc.invalidateQueries({ queryKey: ['providers'] })
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Error al cambiar estado')),
  })
}

export function useGetSuppliedProductCount(proveedorId: number) {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, 'productos-suministrados', proveedorId],
    queryFn: () => supplierService.getSuppliedProductCount(proveedorId),
    enabled: !!proveedorId,
  })
}
