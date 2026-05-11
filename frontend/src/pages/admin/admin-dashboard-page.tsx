import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Panel empresarial: inventario, usuarios y operaciones.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
            <CardDescription>Productos y stock</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Gestiona productos desde el menú lateral.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>Procesamiento y pagos</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Próximo: vista de pedidos y estados.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Roles y accesos</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Próximo: administración de usuarios.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
