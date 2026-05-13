import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { useAuthStore } from '@/modules/auth/application/auth.store'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const schema = z.object({
  username: z.string().min(1, 'El correo o usuario es obligatorio'),
  password: z.string().min(1, 'Contraseña requerida'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const status = useAuthStore((s) => s.status)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/', { replace: true })
    } catch {
      toast.error('Credenciales inválidas')
    }
  })

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.22),_transparent_30%),linear-gradient(135deg,_#09090b_0%,_#16111a_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200">
            <Sparkles className="h-4 w-4" />
            Zero Inventory
          </div>
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Accede a tu catálogo, carrito y pedidos desde una sola cuenta.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-white/70 sm:text-base">
              Inicia sesión para comprar, revisar tus direcciones guardadas y gestionar tu experiencia de cliente.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm text-blue-200">Carrito conectado</div>
              <p className="mt-2 text-sm text-white/70">Tus productos, cantidades y checkout siempre sincronizados.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm text-blue-200">Direcciones reales</div>
              <p className="mt-2 text-sm text-white/70">Usa tus direcciones asociadas al cliente para pagar sin fricción.</p>
            </div>
          </div>
        </section>

        <Card className="border-white/10 bg-black/60 text-white shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
          <CardHeader className="space-y-2 border-b border-white/10 bg-white/5">
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription className="text-white/65">
              Usa tu correo o usuario y contraseña para entrar al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-white/80">
                  Correo o usuario
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    id="username"
                    autoComplete="username"
                    placeholder="tu@correo.com o tu usuario"
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30 focus-visible:ring-blue-500"
                    {...register('username')}
                  />
                </div>
                {errors.username?.message ? (
                  <p className="text-xs text-blue-300">{errors.username.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white/80">
                  Contraseña
                </Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="border-white/10 bg-white/5 pl-10 pr-24 text-white placeholder:text-white/30 focus-visible:ring-blue-500"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/45 transition-colors hover:text-white"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {errors.password?.message ? (
                  <p className="text-xs text-blue-300">{errors.password.message}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Ingresando…' : 'Ingresar'}
              </Button>
            </form>

            <p className="text-sm text-white/65">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-medium text-blue-300 hover:text-blue-200">
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
