import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { confirmPayment } from '@/modules/payment/application/payment.use-cases'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { Button } from '@/shared/ui/button'
import { toast } from 'sonner'

interface PaymentConfirmationModalProps {
  pagoId: number
  monto: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function PaymentConfirmationModal(props: PaymentConfirmationModalProps) {
  const { pagoId, monto, isOpen, onClose, onSuccess } = props

  const confirmMutation = useMutation({
    mutationFn: () => confirmPayment(pagoId),
    onSuccess: () => {
      toast.success('Pago confirmado exitosamente')
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo confirmar el pago'))
    },
  })

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Confirmar pago</h2>

        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto a pagar:</span>
            <span className="text-2xl font-semibold">{formatPrice(monto)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Haz clic en "Confirmar" para procesar el pago.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={confirmMutation.isPending}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={confirmMutation.isPending}
            onClick={() => confirmMutation.mutate()}
          >
            {confirmMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando…
              </>
            ) : (
              'Confirmar pago'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
