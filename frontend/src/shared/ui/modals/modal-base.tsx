import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

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
          'w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-hidden border border-white/10 bg-gray-950/95 p-0 !opacity-100 text-white shadow-2xl shadow-black/50 backdrop-blur-xl',
          contentClassName,
        )}
      >
        <div className="flex max-h-[90vh] flex-col bg-transparent">
          <DialogHeader className="border-b border-white/10 bg-white/5 p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <DialogTitle>{title}</DialogTitle>
                {description ? (
                  <DialogDescription>{description}</DialogDescription>
                ) : null}
              </div>
            </div>
          </DialogHeader>

          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto bg-transparent p-6',
              bodyClassName,
            )}
          >
            {children}
          </div>

          {footer ? (
            <DialogFooter className="border-t border-white/10 bg-white/5 p-6">
              {footer}
            </DialogFooter>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
