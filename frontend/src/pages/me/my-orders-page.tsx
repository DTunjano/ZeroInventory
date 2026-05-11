import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function MyOrdersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mis pedidos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Próximo: listado de pedidos del cliente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>Historial</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Vista placeholder para comenzar integración.
        </CardContent>
      </Card>
    </div>
  )
}
