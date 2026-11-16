import { useId, type ReactNode } from 'react'

import { ModalBase } from './modal-base'

import { Button } from '@/shared/ui/button'

export function FormModal(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  onSubmit: () => void | Promise<void>
  submitText?: string
  cancelText?: string
  isSubmitting?: boolean
  contentClassName?: string
}) {
  const {
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    submitText = 'Guardar',
    cancelText = 'Cancelar',
    isSubmitting,
    contentClassName,
  } = props

  const formId = useId()

  return (
    <ModalBase
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...(description ? { description } : {})}
      {...(contentClassName ? { contentClassName } : {})}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : submitText}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit()
        }}
      >
        {children}
      </form>
    </ModalBase>
  )
}
