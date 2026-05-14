import { useEffect, useState, type ReactNode } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'
import { toast } from 'sonner'
import {
  Loader2,
  Moon,
  Paintbrush,
  Shield,
  Sparkles,
  Sun,
  User,
  UserRound,
  Lock,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react'

import { settingsService } from '../infrastructure/settings.service'
import { useSettingsStore } from '../application/settings.store'
import type { Theme } from '../domain/settings.models'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

const nullableText = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return null
  }
  return value
}, z.string().trim().nullable())

const nullableEmail = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return null
  }
  return value
}, z.string().trim().email('El correo electrónico no es válido').nullable())

const nullablePhone = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return null
  }
  return value
}, z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, 'El teléfono no tiene un formato válido').nullable())

const generalSchema = z.object({
  username: z.string().trim().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: nullableEmail,
  telefono: nullablePhone,
  primerNombre: nullableText,
  segundoNombre: nullableText,
  primerApellido: nullableText,
  segundoApellido: nullableText,
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, 'La nueva contraseña debe incluir mayúsculas, minúsculas, números y símbolos'),
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type GeneralFormValues = {
  username: string
  email: string | null
  telefono: string | null
  primerNombre: string | null
  segundoNombre: string | null
  primerApellido: string | null
  segundoApellido: string | null
}
type PasswordFormValues = z.infer<typeof passwordSchema>
type SaveTarget = 'general' | 'security' | 'appearance' | null

const appearanceSchema = z.object({
  theme: z.enum(['dark', 'light']),
})

type AppearanceFormValues = z.infer<typeof appearanceSchema>

type GeneralSettingsPayload = {
  username: string
  email: string | null
  telefono: string | null
  primerNombre: string | null
  segundoNombre: string | null
  primerApellido: string | null
  segundoApellido: string | null
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { refresh, user } = useAuthStore()
  const { theme: storeTheme, setTheme } = useSettingsStore()
  const roles = (user?.roles ?? []).map((role) => role.toUpperCase())
  const isAdmin = roles.includes('ADMIN')
  const isCustomer = roles.includes('CUSTOMER')
  const isEmployeeOnly = roles.includes('EMPLOYEE') && !isAdmin && !isCustomer
  const canEditGeneral = isAdmin || isCustomer
  const canEditSecurity = isAdmin || isCustomer

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'appearance'>(
    canEditGeneral ? 'general' : 'appearance',
  )
  const [saveTarget, setSaveTarget] = useState<SaveTarget>(null)
  const [leavePromptOpen, setLeavePromptOpen] = useState(false)

  const fullSettingsQuery = useQuery({
    queryKey: ['settings', 'full'],
    queryFn: () => settingsService.getSettings(),
    enabled: canEditGeneral,
  })

  const appearanceQuery = useQuery({
    queryKey: ['settings', 'appearance'],
    queryFn: () => settingsService.getAppearance(),
    enabled: isEmployeeOnly,
  })

  const profile = fullSettingsQuery.data?.profile
  const currentTheme: Theme = (fullSettingsQuery.data?.theme ?? appearanceQuery.data?.theme ?? storeTheme) as Theme

  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema) as Resolver<GeneralFormValues>,
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      telefono: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    mode: 'onChange',
    defaultValues: {
      theme: currentTheme,
    },
  })

  useEffect(() => {
    if (!profile) return

    generalForm.reset({
      username: profile.username,
      email: profile.email ?? '',
      telefono: profile.telefono ?? '',
      primerNombre: profile.primerNombre ?? '',
      segundoNombre: profile.segundoNombre ?? '',
      primerApellido: profile.primerApellido ?? '',
      segundoApellido: profile.segundoApellido ?? '',
    })
  }, [generalForm, profile])

  useEffect(() => {
    appearanceForm.reset({ theme: currentTheme })
  }, [appearanceForm, currentTheme])

  useEffect(() => {
    if (canEditGeneral) {
      setActiveTab((current) => (current === 'appearance' ? 'appearance' : current))
    } else {
      setActiveTab('appearance')
    }
  }, [canEditGeneral])

  const isGeneralDirty = generalForm.formState.isDirty
  const isSecurityDirty = passwordForm.formState.isDirty
  const isAppearanceDirty = appearanceForm.formState.isDirty
  const hasUnsavedChanges = isGeneralDirty || isSecurityDirty || isAppearanceDirty

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handlePromptConfirm = () => {
    setLeavePromptOpen(false)
  }

  const handlePromptCancel = () => {
    setLeavePromptOpen(false)
  }

  const generalMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: async () => {
      toast.success('Configuración personal actualizada')
      await refresh()
      await queryClient.invalidateQueries({ queryKey: ['settings'] })
      generalForm.reset(generalForm.getValues())
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar la configuración'))
    },
  })

  const securityMutation = useMutation({
    mutationFn: settingsService.updatePassword,
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente')
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar la contraseña'))
    },
  })

  const appearanceMutation = useMutation({
    mutationFn: settingsService.updateAppearance,
    onSuccess: async () => {
      const nextTheme = appearanceForm.getValues('theme')
      setTheme(nextTheme)
      toast.success('Tema actualizado correctamente')
      await queryClient.invalidateQueries({ queryKey: ['settings'] })
      appearanceForm.reset({ theme: nextTheme })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el tema'))
    },
  })

  const isLoading = fullSettingsQuery.isLoading || appearanceQuery.isLoading

  const generalButtonDisabled = !isGeneralDirty || generalMutation.isPending || !generalForm.formState.isValid
  const securityButtonDisabled = !isSecurityDirty || securityMutation.isPending || !passwordForm.formState.isValid
  const appearanceButtonDisabled = !isAppearanceDirty || appearanceMutation.isPending || !appearanceForm.formState.isValid

  const handleConfirmSave = async () => {
    const target = saveTarget
    setSaveTarget(null)

    if (target === 'general') {
      const values = generalForm.getValues()
      const payload: GeneralSettingsPayload = {
        username: values.username.trim(),
        email: values.email?.trim() ? values.email.trim().toLowerCase() : null,
        telefono: values.telefono?.trim() ? values.telefono.trim() : null,
        primerNombre: values.primerNombre?.trim() ? values.primerNombre.trim() : null,
        segundoNombre: values.segundoNombre?.trim() ? values.segundoNombre.trim() : null,
        primerApellido: values.primerApellido?.trim() ? values.primerApellido.trim() : null,
        segundoApellido: values.segundoApellido?.trim() ? values.segundoApellido.trim() : null,
      }
      await generalMutation.mutateAsync(payload)
      return
    }

    if (target === 'security') {
      await securityMutation.mutateAsync(passwordForm.getValues())
      return
    }

    if (target === 'appearance') {
      await appearanceMutation.mutateAsync(appearanceForm.getValues())
    }
  }

  const handleConfirmLeave = () => {
    setLeavePromptOpen(false)
    blocker.proceed?.()
  }

  const handleCancelLeave = () => {
    setLeavePromptOpen(false)
    blocker.reset?.()
  }

  const generalCard = (
    <SettingsCard
      icon={<UserRound className="h-5 w-5" />}
      title="General"
      description="Información personal y datos de contacto que usan otras áreas del sistema."
      badge="Perfil"
    >
      <form
        className="space-y-6"
        onSubmit={generalForm.handleSubmit(() => setSaveTarget('general'))}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input id="username" autoComplete="username" {...generalForm.register('username')} />
            <FieldError message={generalForm.formState.errors.username?.message} />
          </Field>
          <Field>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" autoComplete="email" {...generalForm.register('email')} />
            <FieldError message={generalForm.formState.errors.email?.message} />
          </Field>
          <Field>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" autoComplete="tel" {...generalForm.register('telefono')} />
            <FieldError message={generalForm.formState.errors.telefono?.message} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <Label htmlFor="primerNombre">Primer nombre</Label>
            <Input id="primerNombre" {...generalForm.register('primerNombre')} />
          </Field>
          <Field>
            <Label htmlFor="segundoNombre">Segundo nombre</Label>
            <Input id="segundoNombre" {...generalForm.register('segundoNombre')} />
          </Field>
          <Field>
            <Label htmlFor="primerApellido">Primer apellido</Label>
            <Input id="primerApellido" {...generalForm.register('primerApellido')} />
          </Field>
          <Field>
            <Label htmlFor="segundoApellido">Segundo apellido</Label>
            <Input id="segundoApellido" {...generalForm.register('segundoApellido')} />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <BadgeCheck className="h-4 w-4 text-blue-400" />
              Cambios personales
            </div>
            <p className="text-sm text-white/60">
              Los cambios se aplican solo cuando los confirmas desde esta tarjeta.
            </p>
          </div>
          <Button type="submit" disabled={generalButtonDisabled} className="min-w-36">
            {generalMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar cambios
          </Button>
        </div>
      </form>
    </SettingsCard>
  )

  const securityCard = (
    <SettingsCard
      icon={<Lock className="h-5 w-5" />}
      title="Seguridad"
      description="Renueva tu contraseña con validaciones seguras desde frontend y backend."
      badge="Protección"
    >
      <form
        className="space-y-6"
        onSubmit={passwordForm.handleSubmit(() => setSaveTarget('security'))}
      >
        <Field>
          <Label htmlFor="currentPassword">Contraseña actual</Label>
          <Input id="currentPassword" type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
          <FieldError message={passwordForm.formState.errors.currentPassword?.message} />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input id="newPassword" type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
            <FieldError message={passwordForm.formState.errors.newPassword?.message} />
          </Field>
          <Field>
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
            <FieldError message={passwordForm.formState.errors.confirmPassword?.message} />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Shield className="h-4 w-4 text-blue-400" />
              Reglas de contraseña
            </div>
            <p className="text-sm text-white/60">
              La nueva contraseña debe tener mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos.
            </p>
          </div>
          <Button type="submit" disabled={securityButtonDisabled} className="min-w-36">
            {securityMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar cambios
          </Button>
        </div>
      </form>
    </SettingsCard>
  )

  const appearanceCard = (
    <SettingsCard
      icon={<Paintbrush className="h-5 w-5" />}
      title="Apariencia"
      description="Controla únicamente el tema visual. El modo oscuro premium se mantiene como base." 
      badge="Tema"
    >
      <form
        className="space-y-6"
        onSubmit={appearanceForm.handleSubmit(() => setSaveTarget('appearance'))}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ThemeOption
            active={appearanceForm.watch('theme') === 'light'}
            icon={<Sun className="h-5 w-5 text-amber-500" />}
            title="Claro"
            description="Azul y blanco con contraste profesional."
            onClick={() => appearanceForm.setValue('theme', 'light', { shouldDirty: true, shouldValidate: true })}
          />
          <ThemeOption
            active={appearanceForm.watch('theme') === 'dark'}
            icon={<Moon className="h-5 w-5 text-blue-400" />}
            title="Oscuro"
            description="Negro azulado con la identidad premium actual."
            onClick={() => appearanceForm.setValue('theme', 'dark', { shouldDirty: true, shouldValidate: true })}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Vista previa instantánea</p>
              <p className="text-sm text-white/60">El cambio se sincroniza globalmente al confirmarlo.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={appearanceButtonDisabled} className="min-w-36">
            {appearanceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar cambios
          </Button>
        </div>
      </form>
    </SettingsCard>
  )

  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-24">
      <section className="space-y-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 shadow-2xl shadow-black/20 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-100">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Settings premium
          </Badge>
          <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/80">
            {isAdmin ? 'ADMIN' : isCustomer ? 'CUSTOMER' : 'EMPLOYEE'}
          </Badge>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Configuración</h1>
          <p className="max-w-2xl text-sm text-white/65 md:text-base">
            Gestiona tu perfil, protege tu cuenta y ajusta la apariencia con una experiencia limpia y profesional.
          </p>
        </div>
      </section>

      {isEmployeeOnly ? (
        <div className="space-y-6">{appearanceCard}</div>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 rounded-2xl border border-white/10 bg-white/5 p-1">
            <TabsTrigger value="general" className="gap-2 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <User className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Shield className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Paintbrush className="h-4 w-4" />
              Apariencia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">{generalCard}</TabsContent>
          <TabsContent value="security">{securityCard}</TabsContent>
          <TabsContent value="appearance">{appearanceCard}</TabsContent>
        </Tabs>
      )}

      <ConfirmModal
        open={saveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSaveTarget(null)
        }}
        title="¿Deseas aplicar estos cambios?"
        description="Antes de guardar, confirma que quieres persistir las modificaciones realizadas en esta sección."
        confirmText="Aplicar cambios"
        cancelText="Volver"
        confirmVariant="default"
        isConfirming={generalMutation.isPending || securityMutation.isPending || appearanceMutation.isPending}
        onConfirm={() => {
          void handleConfirmSave().catch(() => undefined)
        }}
      />

      <ConfirmModal
        open={leavePromptOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelLeave()
        }}
        title="Tienes cambios sin guardar"
        description="Si sales ahora perderás los cambios realizados."
        confirmText="Salir sin guardar"
        cancelText="Cancelar"
        confirmVariant="destructive"
        onConfirm={handleConfirmLeave}
      />
    </div>
  )
}

function SettingsCard(props: {
  icon: ReactNode
  title: string
  description: string
  badge: string
  children: ReactNode
}) {
  const { icon, title, description, badge, children } = props

  return (
    <Card className="overflow-hidden border-white/10 bg-card/95 text-foreground shadow-2xl shadow-black/20 backdrop-blur-md">
      <CardHeader className="border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
              {icon}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl text-white">{title}</CardTitle>
              <CardDescription className="max-w-2xl text-sm text-white/60">{description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-white/80">
            {badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">{children}</CardContent>
    </Card>
  )
}

function ThemeOption(props: {
  active: boolean
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  const { active, icon, title, description, onClick } = props

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex min-h-32 flex-col justify-between rounded-3xl border p-5 text-left transition-all duration-200',
        active
          ? 'border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/10'
          : 'border-white/10 bg-white/[0.03] hover:border-blue-500/20 hover:bg-white/[0.05]',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-black/10">
          {icon}
        </div>
        {active ? <CheckCircle2 className="h-5 w-5 text-blue-400" /> : null}
      </div>
      <div className="space-y-1">
        <div className="text-base font-semibold text-white">{title}</div>
        <div className="text-sm text-white/65">{description}</div>
      </div>
    </button>
  )
}

function Field(props: { children: ReactNode }) {
  return <div className="space-y-2">{props.children}</div>
}

function FieldError(props: { message: string | undefined }) {
  if (!props.message) return null
  return <p className="text-xs text-red-400">{props.message}</p>
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-24">
      <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="h-8 w-40 rounded-full bg-white/10" />
        <div className="h-4 w-2/3 rounded-full bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-56 rounded-3xl bg-white/[0.04]" />
          <div className="h-56 rounded-3xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  )
}
