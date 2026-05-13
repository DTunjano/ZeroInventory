import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, User, Shield, Paintbrush, Loader2 } from 'lucide-react'

import { settingsService } from '../infrastructure/settings.service'
import { useSettingsStore } from '../application/settings.store'
import type { Theme } from '../domain/settings.models'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/utils'

/* ─── Zod Schemas ─── */

const generalSchema = z.object({
  primerNombre: z.string().optional().or(z.literal('')),
  segundoNombre: z.string().optional().or(z.literal('')),
  primerApellido: z.string().optional().or(z.literal('')),
  segundoApellido: z.string().optional().or(z.literal('')),
  lineaDir: z.string().optional(),
  barrio: z.string().optional(),
  codigoPostal: z.string().optional().or(z.literal('')),
  infoAdicional: z.string().optional().or(z.literal('')),
})

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

const appearanceSchema = z.object({
  theme: z.enum(['dark', 'light']),
})

type GeneralValues = z.infer<typeof generalSchema>
type SecurityValues = z.infer<typeof securitySchema>

/* ─── Settings Page ─── */

export function SettingsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { setTheme, theme: storeTheme } = useSettingsStore()
  const [showUnsaved, setShowUnsaved] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  })

  /* ── General Form ── */
  const generalForm = useForm<GeneralValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      primerNombre: settings?.profile?.primerNombre ?? '',
      segundoNombre: settings?.profile?.segundoNombre ?? '',
      primerApellido: settings?.profile?.primerApellido ?? '',
      segundoApellido: settings?.profile?.segundoApellido ?? '',
      lineaDir: settings?.address?.lineaDir ?? '',
      barrio: settings?.address?.barrio ?? '',
      codigoPostal: settings?.address?.codigoPostal ?? '',
      infoAdicional: settings?.address?.infoAdicional ?? '',
    },
  })

  useEffect(() => {
    if (settings) {
      generalForm.reset({
        primerNombre: settings.profile?.primerNombre ?? '',
        segundoNombre: settings.profile?.segundoNombre ?? '',
        primerApellido: settings.profile?.primerApellido ?? '',
        segundoApellido: settings.profile?.segundoApellido ?? '',
        lineaDir: settings.address?.lineaDir ?? '',
        barrio: settings.address?.barrio ?? '',
        codigoPostal: settings.address?.codigoPostal ?? '',
        infoAdicional: settings.address?.infoAdicional ?? '',
      })
    }
  }, [settings])

  /* ── Security Form ── */
  const securityForm = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  /* ── Theme Form ── */
  const appearanceForm = useForm<{ theme: Theme }>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: { theme: storeTheme },
  })

  useEffect(() => {
    appearanceForm.reset({ theme: settings?.theme ?? storeTheme })
  }, [settings, storeTheme])

  /* ── Dirty state detection ── */
  const isGeneralDirty = generalForm.formState.isDirty
  const isSecurityDirty = securityForm.formState.isDirty
  const isAppearanceDirty = appearanceForm.formState.isDirty
  const hasUnsavedChanges = isGeneralDirty || isSecurityDirty || isAppearanceDirty

  /* ── Mutations ── */
  const updateMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      toast.success('Configuración guardada')
      qc.invalidateQueries({ queryKey: ['settings'] })
      generalForm.reset(generalForm.getValues())
    },
  })

  const passwordMutation = useMutation({
    mutationFn: settingsService.updatePassword,
    onSuccess: () => {
      toast.success('Contraseña actualizada')
      securityForm.reset()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Error al cambiar contraseña')),
  })

  /* ── Submit handlers ── */
  const onGeneralSave = generalForm.handleSubmit((values) => {
    updateMutation.mutate({
      primerNombre: values.primerNombre || undefined,
      segundoNombre: values.segundoNombre || undefined,
      primerApellido: values.primerApellido || undefined,
      segundoApellido: values.segundoApellido || undefined,
      address: {
        lineaDir: values.lineaDir || '',
        barrio: values.barrio || '',
        codigoPostal: values.codigoPostal || null,
        infoAdicional: values.infoAdicional || null,
      },
    })
  })

  const onSecuritySave = securityForm.handleSubmit((values) => {
    passwordMutation.mutate(values)
  })

  const onAppearanceSave = appearanceForm.handleSubmit((values) => {
    setTheme(values.theme)
    updateMutation.mutate({ theme: values.theme })
  })

  /* ── Block tab close / navigation ── */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const roles = useAuthStore((s) => s.user?.roles ?? [])
  const isAdmin = roles.map((r) => r.toUpperCase()).includes('ADMIN')

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Configuración</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Gestiona tu perfil, seguridad y preferencias de la aplicación.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general" className="gap-1.5">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <Paintbrush className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <SettingsCard title="Perfil" description="Tus datos personales.">
              <form id="general-form" onSubmit={onGeneralSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primerNombre">Primer nombre</Label>
                    <Input id="primerNombre" {...generalForm.register('primerNombre')} />
                    {generalForm.formState.errors.primerNombre && (
                      <p className="text-xs text-destructive">{generalForm.formState.errors.primerNombre.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="segundoNombre">Segundo nombre</Label>
                    <Input id="segundoNombre" {...generalForm.register('segundoNombre')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="primerApellido">Primer apellido</Label>
                    <Input id="primerApellido" {...generalForm.register('primerApellido')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="segundoApellido">Segundo apellido</Label>
                    <Input id="segundoApellido" {...generalForm.register('segundoApellido')} />
                  </div>
                </div>
              </form>
            </SettingsCard>

            <SettingsCard title="Dirección" description="Tu dirección de entrega y facturación.">
              <form onSubmit={onGeneralSave} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="lineaDir">Dirección (línea 1)</Label>
                  <Input id="lineaDir" placeholder="Calle 123 # 45-67" {...generalForm.register('lineaDir')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="barrio">Barrio</Label>
                    <Input id="barrio" placeholder="Centro" {...generalForm.register('barrio')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="codigoPostal">Código postal</Label>
                    <Input id="codigoPostal" placeholder="110001" {...generalForm.register('codigoPostal')} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="infoAdicional">Información adicional</Label>
                  <Input id="infoAdicional" placeholder="Apto 301, torre B" {...generalForm.register('infoAdicional')} />
                </div>
              </form>
            </SettingsCard>

            {isAdmin && (
              <SettingsCard title="Negocio" description="Datos de contacto empresarial.">
                <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
                  Los datos empresariales se gestionan desde el panel de administración.
                </div>
              </SettingsCard>
            )}
          </div>
        </TabsContent>

        {/* ── Security ── */}
        <TabsContent value="security">
          <SettingsCard title="Cambiar contraseña" description="Actualiza tu contraseña para mantener tu cuenta segura.">
            <form id="security-form" onSubmit={onSecuritySave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <Input id="currentPassword" type="password" {...securityForm.register('currentPassword')} />
                {securityForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">{securityForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input id="newPassword" type="password" {...securityForm.register('newPassword')} />
                {securityForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{securityForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <Input id="confirmPassword" type="password" {...securityForm.register('confirmPassword')} />
                {securityForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{securityForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </form>
          </SettingsCard>
        </TabsContent>

        {/* ── Appearance ── */}
        <TabsContent value="appearance">
          <SettingsCard title="Tema" description="Elige el estilo visual de la aplicación.">
            <form id="appearance-form" onSubmit={onAppearanceSave} className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => appearanceForm.setValue('theme', 'light')}
                  className={cn(
                    'flex flex-1 items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
                    appearanceForm.watch('theme') === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  )}
                >
                  <Sun className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Claro</p>
                    <p className="text-xs text-muted-foreground">Modo diurno con colores claros</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => appearanceForm.setValue('theme', 'dark')}
                  className={cn(
                    'flex flex-1 items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
                    appearanceForm.watch('theme') === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  )}
                >
                  <Moon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Oscuro</p>
                    <p className="text-xs text-muted-foreground">Modo nocturno con colores oscuros</p>
                  </div>
                </button>
              </div>
            </form>
          </SettingsCard>
        </TabsContent>
      </Tabs>

      {/* ── Unsaved ChangesModal ── */}
      <ConfirmModal
        open={showUnsaved}
        onOpenChange={(open) => {
          setShowUnsaved(open)
          if (!open) setPendingNavigation(null)
        }}
        title="Cambios sin guardar"
        description="Aún tienes cambios sin guardar. ¿Deseas salir sin guardar cambios?"
        confirmText="Sí, salir"
        cancelText="No, continuar editando"
        onConfirm={() => {
          if (pendingNavigation) {
            navigate(pendingNavigation)
          }
        }}
        isConfirming={false}
        confirmVariant="destructive"
      />

      {/* Global Save Button */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border bg-card p-2 shadow-2xl transition-all duration-300',
          hasUnsavedChanges ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
        )}
      >
        <span className="text-sm text-muted-foreground">Cambios sin guardar</span>
        <Button
          size="sm"
          disabled={updateMutation.isPending || passwordMutation.isPending}
          onClick={() => {
            if (isGeneralDirty) onGeneralSave()
            if (isSecurityDirty) onSecuritySave()
            if (isAppearanceDirty) onAppearanceSave()
          }}
        >
          {updateMutation.isPending || passwordMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}

/* ─── Reusable Card ─── */

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-none bg-zinc-900/60 text-white shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
        {description && <CardDescription className="text-zinc-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
