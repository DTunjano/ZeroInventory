import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-3 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Página no encontrada</h1>
      <p className="text-sm text-muted-foreground">
        La ruta solicitada no existe.
      </p>
      <div>
        <Button asChild>
          <Link to="/tienda">Volver a la tienda</Link>
        </Button>
      </div>
    </div>
  )
}
