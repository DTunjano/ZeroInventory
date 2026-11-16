import { useAuthStore } from '@/modules/auth/application/auth.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function DashboardPage() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Infra FE lista: router + auth store + refresh automático.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sesión</CardTitle>
          <CardDescription>Estado actual detectado desde cookies.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid gap-2">
            <div>
              <span className="text-muted-foreground">Status: </span>
              <span className="font-medium">{status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Usuario: </span>
              <span className="font-medium">{user?.username ?? '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Roles: </span>
              <span className="font-medium">{user?.roles?.join(', ') ?? '—'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
