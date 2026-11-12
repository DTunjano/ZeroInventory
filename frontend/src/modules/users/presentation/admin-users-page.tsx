import { useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  listUsers,
  saveUser,
  setUserActive,
} from '../application/users.use-cases'
import {
  userRoles,
  type ManagedUser,
  type SaveUserInput,
} from '../domain/user.models'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { FormModal } from '@/shared/ui/modals/form-modal'

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'El usuario requiere al menos 3 caracteres'),
  password: z
    .string()
    .max(72, 'Máximo 72 caracteres')
    .refine((value) => !value || value.length >= 6, 'Mínimo 6 caracteres'),
  email: z.union([z.literal(''), z.email('Correo inválido')]),
  telefono: z
    .string()
    .refine(
      (value) => !value || /^[0-9+()\-\s]{7,20}$/.test(value),
      'Teléfono inválido',
    ),
  primerNombre: z.string(),
  segundoNombre: z.string(),
  primerApellido: z.string(),
  segundoApellido: z.string(),
  roles: z.array(z.enum(userRoles)).min(1, 'Selecciona al menos un rol'),
  documento: z.string().trim().max(100),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>
const roleLabels = {
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
  CUSTOMER: 'Cliente',
}
const emptyForm: FormValues = {
  username: '',
  password: '',
  email: '',
  telefono: '',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  roles: [],
  documento: '',
  isActive: true,
}

export function AdminUsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
  })
  const selectedRoles = form.watch('roles')
  const query = useQuery({
    queryKey: ['users', debouncedSearch, status, page],
    queryFn: () =>
      listUsers({
        username: debouncedSearch,
        page,
        ...(status !== 'all' ? { isActive: status === 'active' } : {}),
      }),
    placeholderData: keepPreviousData,
  })
  const invalidate = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['users'] }),
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] }),
    ])
  async function afterSave(id: number) {
    if (id === useAuthStore.getState().user?.usuarioId)
      await useAuthStore.getState().refresh()
    await invalidate()
  }
  const mutation = useMutation({
    mutationFn: (input: SaveUserInput) => saveUser(editing?.usuarioId, input),
    onSuccess: async (saved) => {
      await afterSave(saved.usuarioId)
      setOpen(false)
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado')
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el usuario')),
  })
  const statusMutation = useMutation({
    mutationFn: async (user: ManagedUser) => {
      await setUserActive(user.usuarioId, !user.isActive)
      return user
    },
    onSuccess: async (user) => {
      await afterSave(user.usuarioId)
      toast.success(
        user.isActive ? 'Usuario desactivado' : 'Usuario reactivado',
      )
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar el estado')),
  })
  function edit(user: ManagedUser | null) {
    setEditing(user)
    form.reset(
      user
        ? {
            ...emptyForm,
            ...user,
            email: user.email ?? '',
            telefono: user.telefono ?? '',
            primerNombre: user.primerNombre ?? '',
            segundoNombre: user.segundoNombre ?? '',
            primerApellido: user.primerApellido ?? '',
            segundoApellido: user.segundoApellido ?? '',
          }
        : emptyForm,
    )
    setOpen(true)
  }
  const submit = form.handleSubmit((values) => {
    if (!editing && !values.password) {
      form.setError('password', { message: 'Contraseña requerida' })
      return
    }
    if (!editing && values.roles.includes('CUSTOMER') && !values.documento) {
      form.setError('documento', {
        message: 'Documento requerido para el perfil de cliente',
      })
      return
    }
    mutation.mutate({
      username: values.username,
      email: values.email.trim().toLowerCase() || null,
      telefono: values.telefono.trim() || null,
      primerNombre: values.primerNombre.trim() || null,
      segundoNombre: values.segundoNombre.trim() || null,
      primerApellido: values.primerApellido.trim() || null,
      segundoApellido: values.segundoApellido.trim() || null,
      roles: values.roles,
      ...(values.password ? { password: values.password } : {}),
      ...(values.documento ? { documento: values.documento } : {}),
      ...(editing ? { isActive: values.isActive } : {}),
    })
  })
  const pages = Math.max(1, query.data?.totalPages ?? 1)
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios y roles</h1>
          <p className="text-sm text-muted-foreground">
            Administra cuentas, acceso y asignaciones. Las cuentas se desactivan
            conservando su historial.
          </p>
        </div>
        <Button onClick={() => edit(null)}>Nuevo usuario</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label="Buscar por usuario"
          placeholder="Buscar por usuario…"
          className="max-w-sm"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <select
          aria-label="Estado de usuarios"
          className="rounded-md border bg-background px-3 py-2"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
      {query.isPending && <p role="status">Cargando usuarios…</p>}
      {query.isError && (
        <div role="alert">
          <p>
            {getApiErrorMessage(
              query.error,
              'No se pudieron cargar los usuarios',
            )}
          </p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Reintentar
          </Button>
        </div>
      )}
      {!query.isError && query.data && (
        <>
          <p className="text-sm text-muted-foreground">
            {query.data.total}{' '}
            {query.data.total === 1
              ? 'cuenta encontrada'
              : 'cuentas encontradas'}
          </p>
          {query.data.data.length === 0 && (
            <p>No hay usuarios que coincidan con los filtros.</p>
          )}
          <div className="grid gap-3">
            {query.data.data.map((user) => (
              <article
                key={user.usuarioId}
                aria-label={`Usuario ${user.username}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div className="min-w-0 space-y-2">
                  <h2 className="break-all font-semibold">{user.username}</h2>
                  <p className="break-all text-sm text-muted-foreground">
                    {[user.primerNombre, user.primerApellido]
                      .filter(Boolean)
                      .join(' ') || 'Sin nombre registrado'}{' '}
                    · {user.email ?? 'Sin correo'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    {user.roles.map((role) => (
                      <Badge key={role} variant="outline">
                        {roleLabels[role]}
                      </Badge>
                    ))}
                    {!user.roles.length && (
                      <Badge variant="outline">Sin roles</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => edit(user)}>
                    Editar {user.username}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={statusMutation.isPending || mutation.isPending}
                    onClick={() => statusMutation.mutate(user)}
                  >
                    {user.isActive ? 'Desactivar' : 'Reactivar'} {user.username}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={page <= 1 || query.isPlaceholderData}
              onClick={() => setPage((value) => value - 1)}
            >
              Anterior
            </Button>
            <span>
              {page} / {pages}
            </span>
            <Button
              variant="outline"
              disabled={page >= pages || query.isPlaceholderData}
              onClick={() => setPage((value) => value + 1)}
            >
              Siguiente
            </Button>
          </div>
        </>
      )}
      <FormModal
        open={open}
        onOpenChange={(value) => {
          if (!mutation.isPending) setOpen(value)
        }}
        title={editing ? `Editar ${editing.username}` : 'Nuevo usuario'}
        description="Asigna uno o más de los tres roles del sistema. Los cambios de acceso se comprueban en cada solicitud."
        onSubmit={submit}
        isSubmitting={mutation.isPending}
      >
        {(
          [
            ['username', 'Usuario', 'text'],
            [
              'password',
              editing ? 'Nueva contraseña (opcional)' : 'Contraseña',
              'password',
            ],
            ['email', 'Correo (opcional)', 'email'],
            ['telefono', 'Teléfono (opcional)', 'tel'],
            ['primerNombre', 'Primer nombre', 'text'],
            ['segundoNombre', 'Segundo nombre', 'text'],
            ['primerApellido', 'Primer apellido', 'text'],
            ['segundoApellido', 'Segundo apellido', 'text'],
          ] as const
        ).map(([name, label, type]) => (
          <div key={name} className="space-y-1">
            <Label htmlFor={`user-${name}`}>{label}</Label>
            <Input
              id={`user-${name}`}
              type={type}
              autoComplete={name === 'password' ? 'new-password' : 'off'}
              {...form.register(name)}
              disabled={mutation.isPending}
            />
            {form.formState.errors[name] && (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors[name]?.message}
              </p>
            )}
          </div>
        ))}
        <fieldset disabled={mutation.isPending} className="space-y-2">
          <legend className="mb-2 font-medium">Roles</legend>
          {userRoles.map((role) => (
            <label key={role} className="flex items-center gap-2">
              <input type="checkbox" value={role} {...form.register('roles')} />
              {roleLabels[role]}
            </label>
          ))}
          {form.formState.errors.roles && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.roles.message}
            </p>
          )}
        </fieldset>
        {selectedRoles.includes('CUSTOMER') && (
          <div className="space-y-1">
            <Label htmlFor="user-documento">Documento del cliente</Label>
            <Input
              id="user-documento"
              {...form.register('documento')}
              disabled={mutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Requerido si la cuenta todavía no tiene perfil de cliente. No
              cambia documentos de perfiles existentes.
            </p>
            {form.formState.errors.documento && (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.documento.message}
              </p>
            )}
          </div>
        )}
        {selectedRoles.includes('EMPLOYEE') && (
          <p className="text-xs text-muted-foreground">
            El rol habilita el acceso del empleado. Su ficha laboral se
            administra en Empleados.
          </p>
        )}
        {editing && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...form.register('isActive')}
              disabled={mutation.isPending}
            />
            Cuenta activa
          </label>
        )}
      </FormModal>
    </div>
  )
}
