import { Toaster } from 'sonner'

export function Sonner() {
  return (
    <Toaster
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'border bg-background text-foreground shadow-lg',
          title: 'text-sm font-semibold',
          description: 'text-sm text-muted-foreground',
        },
      }}
    />
  )
}
