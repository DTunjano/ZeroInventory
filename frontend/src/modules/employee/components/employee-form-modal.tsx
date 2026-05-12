import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ModalBase } from '@/shared/ui/modals/modal-base'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  type Empleado,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
  employeeService,
} from '../services/employee.service'

const baseSchema = {
  nombre: z.string().trim().min(1, 'Nombre requerido'),
  email: z.string().email('Email no válido').trim().toLowerCase(),
  documento: z.string().trim().optional(),
  telefono: z.string().trim().optional(),
}

const createSchema = z
  .object({
    ...baseSchema,
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

const updateSchema = z
  .object({
    nombre: z.string().trim().min(1, 'Nombre requerido').optional(),
    email: z.string().email('Email no válido').trim().toLowerCase().optional(),
    password: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, {
        message: 'La contraseña debe tener al menos 6 caracteres',
      }),
    confirmPassword: z.string().optional(),
    documento: z.string().trim().optional(),
    telefono: z.string().trim().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export interface EmployeeFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Empleado | null
}

type CreateFormValues = z.infer<typeof createSchema>
type UpdateFormValues = z.infer<typeof updateSchema>
type FormValues = CreateFormValues | UpdateFormValues

export function EmployeeFormModal({
  open,
  onOpenChange,
  employee,
}: EmployeeFormModalProps) {
  const isEdit = !!employee
  const formId = useId()
  const qc = useQueryClient()

  const schema = isEdit ? updateSchema : createSchema

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      documento: '',
      telefono: '',
    },
  })

  useEffect(() => {
    if (open && isEdit && employee) {
      form.reset({
        nombre: employee.nombre,
        email: employee.email,
        password: '',
        confirmPassword: '',
        documento: employee.documento ?? '',
        telefono: employee.telefono ?? '',
      })
    } else if (open && !isEdit) {
      form.reset({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        documento: '',
        telefono: '',
      })
    }
  }, [open, employee, isEdit, form])

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
    if (!v) {
      form.reset()
    }
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) =>
      employeeService.createEmployee(payload),
    onSuccess: () => {
      toast.success('Empleado creado')
      void qc.invalidateQueries({ queryKey: ['employees'] })
      onOpenChange(false)
      form.reset()
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'No se pudo crear el empleado')),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateEmployeePayload
    }) => employeeService.updateEmployee(id, payload),
    onSuccess: () => {
      toast.success('Empleado actualizado')
      void qc.invalidateQueries({ queryKey: ['employees'] })
      onOpenChange(false)
      form.reset()
    },
    onError: (err) =>
      toast.error(
        getApiErrorMessage(err, 'No se pudo actualizar el empleado'),
      ),
  })

  const onSubmit = (values: FormValues) => {
    if (isEdit && employee) {
      const v = values as UpdateFormValues
      const payload: UpdateEmployeePayload = {}
      if (v.nombre !== undefined) payload.nombre = v.nombre
      if (v.email !== undefined) payload.email = v.email
      if (v.password) payload.password = v.password
      payload.documento = v.documento ?? null
      payload.telefono = v.telefono ?? null
      updateMutation.mutate({ id: employee.empleadoId, payload })
    } else {
      const v = values as CreateFormValues
      const payload: CreateEmployeePayload = {
        nombre: v.nombre,
        email: v.email,
        password: v.password,
        documento: v.documento ?? null,
        telefono: v.telefono ?? null,
      }
      createMutation.mutate(payload)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <ModalBase
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? 'Editar empleado' : 'Crear empleado'}
      description="Todos los campos marcados son obligatorios."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="grid gap-4 py-2"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(onSubmit)()
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="nombre">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nombre"
            placeholder="Juan Pérez"
            {...form.register('nombre')}
          />
          {form.formState.errors.nombre && (
            <p className="text-xs text-destructive">
              {String(form.formState.errors.nombre.message)}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="juan.perez@empresa.com"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {String(form.formState.errors.email.message)}
            </p>
          )}
        </div>

        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">
                Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.password.message)}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">
                Confirmar contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="******"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.confirmPassword.message)}
                </p>
              )}
            </div>
          </div>
        )}

        {isEdit && (
          <div className="grid gap-2">
            <Label htmlFor="password">Nueva contraseña (opcional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="******"
              {...form.register('password')}
            />
            <p className="text-xs text-muted-foreground">
              Dejar vacío para mantener la contraseña actual.
            </p>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {String(form.formState.errors.password.message)}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">
                Confirmar nueva contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="******"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.confirmPassword.message)}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="documento">Documento</Label>
            <Input
              id="documento"
              placeholder="1234567890"
              {...form.register('documento')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              placeholder="0991234567"
              {...form.register('telefono')}
            />
          </div>
        </div>
      </form>
    </ModalBase>
  )
}
