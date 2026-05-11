import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { employeeService, type Empleado } from '../services/employee.service'
import { EmployeeFormModal } from '../components/employee-form-modal'
import { DeactivateEmployeeModal } from '../components/deactivate-employee-modal'

const EMPLOYEES_QUERY_KEY = 'employees'

export function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Empleado | null>(null)
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false)
  const [deactivatingEmployee, setDeactivatingEmployee] =
    useState<Empleado | null>(null)

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: [EMPLOYEES_QUERY_KEY, { page: 1, limit: 10 }],
    queryFn: () =>
      employeeService.listEmployees({ page: 1, limit: 10 }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (empleadoId: number) =>
      employeeService.deactivateEmployee(empleadoId),
    onSuccess: () => {
      toast.success('Empleado desactivado')
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
      setDeactivateModalOpen(false)
      setDeactivatingEmployee(null)
    },
    onError: (err) =>
      toast.error(
        getApiErrorMessage(err, 'No se pudo desactivar el empleado'),
      ),
  })

  const filteredEmployees =
    data?.data?.filter((emp) => {
      if (!searchTerm) return true
      const q = searchTerm.toLowerCase()
      return (
        emp.nombre.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q)
      )
    }) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empleados</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestión de empleados del sistema.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEmployee(null)
            setCreateModalOpen(true)
          }}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Nuevo empleado
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por nombre o email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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

      <DeactivateEmployeeModal
        open={deactivateModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeactivateModalOpen(false)
            setDeactivatingEmployee(null)
          }
        }}
        employee={deactivatingEmployee}
        onConfirm={() => {
          if (deactivatingEmployee) {
            deactivateMutation.mutate(deactivatingEmployee.empleadoId)
          }
        }}
        isConfirming={deactivateMutation.isPending}
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Cargando empleados…
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length ? (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.empleadoId}>
                  <TableCell className="font-medium">
                    {emp.nombre}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {emp.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">EMPLOYEE</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        emp.estado === 'ACTIVO' ? 'default' : 'secondary'
                      }
                      className={
                        emp.estado === 'ACTIVO'
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }
                    >
                      {emp.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEmployee(emp)}
                      >
                        Editar
                      </Button>
                      {emp.estado === 'ACTIVO' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeactivatingEmployee(emp)
                            setDeactivateModalOpen(true)
                          }}
                          disabled={deactivateMutation.isPending}
                        >
                          Desactivar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {searchTerm
                    ? 'Sin resultados para la búsqueda.'
                    : 'Sin empleados registrados.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
