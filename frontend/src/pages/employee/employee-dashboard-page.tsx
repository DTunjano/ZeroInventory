import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function EmployeeDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Empleado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Panel operativo: inventario y tareas asignadas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accesos</CardTitle>
          <CardDescription>Rol EMPLOYEE</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Próximo: vistas de productos y pedidos según permisos.
        </CardContent>
      </Card>
    </div>
  )
}
