import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { IdCard, LockKeyhole, Mail, Sparkles, User } from 'lucide-react'
import { toast } from 'sonner'

import { useAuthStore } from '@/modules/auth/application/auth.store'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const schema = z
  .object({
    username: z.string().email('Ingresa un correo válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    documento: z.string().min(1, 'El documento es obligatorio'),
    primerNombre: z.string().optional(),
    primerApellido: z.string().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const registerAccount = useAuthStore((s) => s.register)
  const status = useAuthStore((s) => s.status)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      documento: '',
      primerNombre: '',
      primerApellido: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const primerNombre = values.primerNombre?.trim()
      const primerApellido = values.primerApellido?.trim()

      await registerAccount({
        username: values.username,
        password: values.password,
        documento: values.documento,
        ...(primerNombre ? { primerNombre } : {}),
        ...(primerApellido ? { primerApellido } : {}),
      })
      toast.success('Cuenta creada correctamente')
      navigate('/home', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo crear la cuenta'))
    }
  })

  return (
    <div className="dark min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#1b140f_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="order-2 border-white/10 bg-black/60 text-white shadow-2xl shadow-blue-950/20 backdrop-blur-xl lg:order-1">
          <CardHeader className="space-y-2 border-b border-white/10 bg-white/5">
            <CardTitle className="text-2xl">Crear cuenta</CardTitle>
            <CardDescription className="text-white/65">
              Registra tu acceso de cliente y deja lista tu base para direcciones y compras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-white/80">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    id="username"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30 focus-visible:ring-blue-500"
                    {...register('username')}
                  />
                </div>
                {errors.username?.message ? (
                  <p className="text-xs text-blue-300">{errors.username.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="primerNombre" className="text-white/80">
                    Nombre
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <Input
                      id="primerNombre"
                      autoComplete="given-name"
                      placeholder="Juan"
                      className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30 focus-visible:ring-blue-500"
                      {...register('primerNombre')}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="primerApellido" className="text-white/80">
                    Apellido
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <Input
                      id="primerApellido"
                      autoComplete="family-name"
                      placeholder="Pérez"
                      className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30 focus-visible:ring-blue-500"
                      {...register('primerApellido')}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="documento" className="text-white/80">
                  Documento
                </Label>
                <div className="relative">
                  <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    id="documento"
                    placeholder="1234567890"
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30 focus-visible:ring-blue-500"
                    {...register('documento')}
                  />
                </div>
                {errors.documento?.message ? (
                  <p className="text-xs text-blue-300">{errors.documento.message}</p>
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
                    autoComplete="new-password"
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

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-white/80">
                  Confirmar contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-blue-500"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword?.message ? (
                  <p className="text-xs text-blue-300">{errors.confirmPassword.message}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue-500 text-black hover:bg-blue-400"
              >
                {status === 'loading' ? 'Creando cuenta…' : 'Crear cuenta'}
              </Button>
            </form>

            <p className="text-sm text-white/65">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>

        <section className="order-1 space-y-6 lg:order-2 lg:pl-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200">
            <Sparkles className="h-4 w-4" />
            Cliente nuevo
          </div>
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Regístrate y deja listo tu acceso para comprar y guardar direcciones.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-white/70 sm:text-base">
              La cuenta se crea como cliente por defecto para que luego puedas completar tu carrito, tu checkout y tu historial de pedidos.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm text-blue-200">Rol CUSTOMER</div>
              <p className="mt-2 text-sm text-white/70">El registro queda preparado como cliente desde el inicio.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm text-blue-200">Direcciones asociadas</div>
              <p className="mt-2 text-sm text-white/70">Tus direcciones se guardan sobre el cliente y aparecen en checkout.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
