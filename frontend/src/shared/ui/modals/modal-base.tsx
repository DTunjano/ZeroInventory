import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/utils'

export function ModalBase(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
  bodyClassName?: string
}) {
  const {
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    contentClassName,
    bodyClassName,
  } = props

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-hidden bg-white p-0 !opacity-100',
          contentClassName,
        )}
      >
        <div className="flex max-h-[90vh] flex-col bg-white">
          <DialogHeader className="border-b border-border bg-white p-6">
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>

          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto bg-white p-6',
              bodyClassName,
            )}
          >
            {children}
          </div>

          {footer ? (
            <DialogFooter className="border-t border-border bg-white p-6">
              {footer}
            </DialogFooter>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
