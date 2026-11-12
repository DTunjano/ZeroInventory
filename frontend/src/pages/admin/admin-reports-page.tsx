import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/button'

export function AdminReportsPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 rounded-xl border p-6">
      <h1 className="text-2xl font-semibold">Reportes avanzados</h1>
      <p className="text-muted-foreground">
        Esta funcionalidad está aplazada y no forma parte de la primera entrega.
        Puedes consultar los indicadores disponibles en el dashboard.
      </p>
      <Button asChild>
        <Link to="/admin/dashboard">Ir al dashboard</Link>
      </Button>
    </section>
  )
}
