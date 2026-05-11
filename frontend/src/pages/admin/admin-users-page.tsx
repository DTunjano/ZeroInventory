import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Administración de usuarios y roles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CRUD de usuarios</CardTitle>
          <CardDescription>Próximo: listado + asignación de roles</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Vista placeholder para comenzar integración.
        </CardContent>
      </Card>
    </div>
  )
}
