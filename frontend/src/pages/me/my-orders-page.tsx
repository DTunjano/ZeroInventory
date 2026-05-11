import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function MyOrdersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mis pedidos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aquí verás el historial y el estado de tus compras cuando el flujo de pedidos esté completo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>Seguimiento de compras</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          La vista está reservada para el historial de pedidos del cliente.
        </CardContent>
      </Card>
    </div>
  )
}
