import type { Empleado } from '../services/employee.service'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'

export interface DeactivateEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Empleado | null
  onConfirm: () => void
  isConfirming: boolean
}

export function DeactivateEmployeeModal({
  open,
  onOpenChange,
  employee,
  onConfirm,
  isConfirming,
}: DeactivateEmployeeModalProps) {
  const isDeactivate = employee?.estado === 'ACTIVO'
  const title = isDeactivate ? 'Desactivar empleado' : 'Activar empleado'
  const description = employee
    ? isDeactivate
      ? `¿Estás seguro de que deseas desactivar a "${employee.nombre}"? Esta acción no elimina al empleado de la base de datos, solo cambia su estado a INACTIVO.`
      : `¿Estás seguro de que deseas activar a "${employee.nombre}"? Esto cambiará su estado a ACTIVO.`
    : '¿Estás seguro?'
  const confirmText = isDeactivate ? 'Desactivar' : 'Activar'
  const confirmVariant = isDeactivate ? 'destructive' : 'default'

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText={confirmText}
      onConfirm={onConfirm}
      isConfirming={isConfirming}
      confirmVariant={confirmVariant}
    />
  )
}
