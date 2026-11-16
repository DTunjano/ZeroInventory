import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

export function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Siguiente paso: CRUD de productos + upload Cloudinary.
      </p>

      <div className="mt-6">
        <Button asChild>
          <Link to="/admin/products">Gestionar productos</Link>
        </Button>
      </div>
    </div>
  )
}
