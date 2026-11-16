import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { employeeService } from '../services/employee.service'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import type { CreateEmployeePayload, UpdateEmployeePayload } from '../services/employee.service'

const EMPLOYEES_QUERY_KEY = 'employees'

export function useEmployees(params: {
  page?: number
  limit?: number
  estado?: string
  nombre?: string
  email?: string
} = {}) {
  const queryKey = [EMPLOYEES_QUERY_KEY, params]
  return useQuery({
    queryKey,
    queryFn: () => employeeService.listEmployees(params),
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) =>
      employeeService.createEmployee(payload),
    onSuccess: () => {
      toast.success('Empleado creado')
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'No se pudo crear el empleado')),
  })
}

export function useUpdateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      empleadoId,
      payload,
    }: {
      empleadoId: number
      payload: UpdateEmployeePayload
    }) => employeeService.updateEmployee(empleadoId, payload),
    onSuccess: () => {
      toast.success('Empleado actualizado')
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
    },
    onError: (err) =>
      toast.error(
        getApiErrorMessage(err, 'No se pudo actualizar el empleado'),
      ),
  })
}

export function useDeactivateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (empleadoId: number) =>
      employeeService.deactivateEmployee(empleadoId),
    onSuccess: () => {
      toast.success('Empleado desactivado')
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
    },
    onError: (err) =>
      toast.error(
        getApiErrorMessage(err, 'No se pudo desactivar el empleado'),
      ),
  })
}

export function useToggleEmployeeStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (empleadoId: number) =>
      employeeService.toggleEmployeeStatus(empleadoId),
    onSuccess: () => {
      toast.success('Estado del empleado actualizado')
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] })
    },
    onError: (err) =>
      toast.error(
        getApiErrorMessage(err, 'No se pudo cambiar el estado del empleado'),
      ),
  })
}
