import { ModalBase } from './modal-base'

import { Button } from '@/shared/ui/button'

export function ConfirmModal(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  isConfirming?: boolean
  confirmVariant?: 'default' | 'destructive'
}) {
  const {
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    isConfirming,
    confirmVariant = 'destructive',
  } = props

  return (
    <ModalBase
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description ?? 'Esta acción no se puede deshacer.'}
      contentClassName="max-w-lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isConfirming}
            onClick={() => onConfirm()}
          >
            {isConfirming ? 'Procesando…' : confirmText}
          </Button>
        </>
      }
    >
      {null}
    </ModalBase>
  )
}
