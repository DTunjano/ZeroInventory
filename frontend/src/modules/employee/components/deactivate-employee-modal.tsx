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
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Desactivar empleado"
      description={
        employee
          ? `¿Estás seguro de que deseas desactivar a "${employee.nombre}"? Esta acción no elimina al empleado de la base de datos, solo cambia su estado a INACTIVO.`
          : '¿Estás seguro de que deseas desactivar este empleado?'
      }
      confirmText="Desactivar"
      onConfirm={onConfirm}
      isConfirming={isConfirming}
      confirmVariant="destructive"
    />
  )
}
