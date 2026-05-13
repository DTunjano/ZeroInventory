import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserPlus, Users } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { employeeService, type Empleado } from '../services/employee.service'
import { EmployeeFormModal } from '../components/employee-form-modal'
import { EmployeeCard } from '../components/employee-card'

const EMPLOYEES_QUERY_KEY = 'employees'
type FilterStatus = 'ALL' | 'ACTIVO' | 'INACTIVO'

export function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Empleado | null>(null)
  const [statusModalEmployee, setStatusModalEmployee] = useState<Empleado | null>(
    null,
  )
  const [deleteModalEmployee, setDeleteModalEmployee] = useState<Empleado | null>(
    null,
  )

  const qc = useQueryClient()

  const listParams = {
    page: 1,
    limit: 60,
    ...(statusFilter !== 'ALL' ? { estado: statusFilter } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: [EMPLOYEES_QUERY_KEY, listParams],
    queryFn: () => employeeService.listEmployees(listParams),
  })

  const toggleMutation = useMutation({
    mutationFn: (empleadoId: number) =>
      employeeService.toggleEmployeeStatus(empleadoId),
    onSuccess: (empleado) => {
      toast.success(
        empleado.estado === 'ACTIVO' ? 'Empleado activado' : 'Empleado desactivado',
      )
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
      setStatusModalEmployee(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Error de red')),
  })

  const deleteMutation = useMutation({
    mutationFn: (empleadoId: number) => employeeService.deactivateEmployee(empleadoId),
    onSuccess: () => {
      toast.success('Empleado desactivado')
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
      setDeleteModalEmployee(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Error de red')),
  })

  const filteredEmployees =
    data?.data?.filter((emp) => {
      if (!searchTerm) return true
      const q = searchTerm.toLowerCase()
      return (
        emp.nombre.toLowerCase().includes(q) ||
        emp.nombreCompleto.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q)
      )
    }) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Gestión de Empleados</h1>
          <p className="mt-2 text-lg text-zinc-300">
            {data?.total ?? 0} colaboradores del bar y coctelería
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEmployee(null)
            setCreateModalOpen(true)
          }}
          className="gap-2 rounded-xl bg-blue-600 px-5 py-2 text-base font-semibold hover:bg-blue-500"
        >
          <UserPlus className="h-5 w-5" />
          Agregar empleado
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xl">
          <Input
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-xl border-white/10 bg-zinc-950/70 px-4 text-lg text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-zinc-900/70 p-1">
          {(
            [
              ['Todos', 'ALL'],
              ['Activos', 'ACTIVO'],
              ['Inactivos', 'INACTIVO'],
            ] as const
          ).map(([label, value]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-300 hover:bg-white/10 hover:text-white'
              }`}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <EmployeeFormModal
        open={createModalOpen || !!editingEmployee}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false)
            setEditingEmployee(null)
          } else {
            setCreateModalOpen(true)
          }
        }}
        employee={editingEmployee}
      />

      <ConfirmModal
        open={!!statusModalEmployee}
        onOpenChange={(open) => {
          if (!open) setStatusModalEmployee(null)
        }}
        title={
          statusModalEmployee?.estado === 'ACTIVO'
            ? 'Desactivar empleado'
            : 'Activar empleado'
        }
        description={
          statusModalEmployee
            ? `¿Deseas ${statusModalEmployee.estado === 'ACTIVO' ? 'desactivar' : 'activar'} a ${statusModalEmployee.nombre}?`
            : undefined
        }
        confirmText={
          statusModalEmployee?.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'
        }
        confirmVariant={
          statusModalEmployee?.estado === 'ACTIVO' ? 'destructive' : 'default'
        }
        onConfirm={() => {
          if (!statusModalEmployee) return
          toggleMutation.mutate(statusModalEmployee.empleadoId)
        }}
        isConfirming={toggleMutation.isPending}
      />

      <ConfirmModal
        open={!!deleteModalEmployee}
        onOpenChange={(open) => {
          if (!open) setDeleteModalEmployee(null)
        }}
        title="Eliminar empleado"
        description={
          deleteModalEmployee
            ? `Se desactivará a ${deleteModalEmployee.nombre} (soft delete). ¿Deseas continuar?`
            : undefined
        }
        confirmText="Eliminar"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deleteModalEmployee) return
          deleteMutation.mutate(deleteModalEmployee.empleadoId)
        }}
        isConfirming={deleteMutation.isPending}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-10 text-center text-zinc-400">
          Cargando empleados...
        </div>
      ) : filteredEmployees.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.empleadoId}
              empleado={emp}
              onEdit={(id) => {
                const target = filteredEmployees.find((e) => e.empleadoId === id)
                if (target) setEditingEmployee(target)
              }}
              onToggleStatus={(id) => {
                const target = filteredEmployees.find((e) => e.empleadoId === id)
                if (target) setStatusModalEmployee(target)
              }}
              onDelete={(id) => {
                const target = filteredEmployees.find((e) => e.empleadoId === id)
                if (target) setDeleteModalEmployee(target)
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-10 text-center text-zinc-400">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <Users className="h-6 w-6 text-zinc-400" />
          </div>
          <p className="text-base text-zinc-300">
            {searchTerm
              ? 'No hay empleados que coincidan con tu búsqueda.'
              : 'Sin empleados registrados.'}
          </p>
        </div>
      )}
    </div>
  )
}
