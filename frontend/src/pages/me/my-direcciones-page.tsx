import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MapPin, Plus, Pencil, Star, Loader2, Check, Power } from 'lucide-react'

import { getMyDirecciones, createMyDireccion, updateMyDireccion, deleteMyDireccion, setPredeterminada } from '@/modules/direcciones/application/direcciones.use-cases'
import { direccionesQueryKey } from '@/modules/direcciones/infrastructure/direcciones.api'
import type { DireccionView, CreateDireccionInput } from '@/modules/direcciones/domain/direccion.models'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { ConfirmModal } from '@/shared/ui/modals/confirm-modal'

function DireccionForm({
  direccion,
  onCancel,
  onSave,
  isSaving,
}: {
  direccion?: DireccionView
  onCancel: () => void
  onSave: (input: CreateDireccionInput) => void
  isSaving: boolean
}) {
  const [lineaDir, setLineaDir] = useState(direccion?.lineaDir ?? '')
  const [barrio, setBarrio] = useState(direccion?.barrio ?? '')
  const [codigoPostal, setCodigoPostal] = useState(direccion?.codigoPostal ?? '')
  const [infoAdiccional, setInfoAdiccional] = useState(direccion?.infoAdiccional ?? '')
  const [esPredeterminada, setEsPredeterminada] = useState(direccion?.esPredeterminada ?? false)

  function handleSave() {
    if (!lineaDir.trim() || !barrio.trim()) {
      toast.error('Completa la línea de dirección y el barrio')
      return
    }
    onSave({
      lineaDir: lineaDir.trim(),
      barrio: barrio.trim(),
      codigoPostal: codigoPostal.trim() || null,
      infoAdiccional: infoAdiccional.trim() || null,
      esPredeterminada,
    })
  }

  return (
    <Card className="border border-blue-500/30 shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Línea de dirección</label>
          <Input
            value={lineaDir}
            onChange={(e) => setLineaDir(e.target.value)}
            placeholder="Calle 10 No. 20-30"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Barrio</label>
          <Input
            value={barrio}
            onChange={(e) => setBarrio(e.target.value)}
            placeholder="Centro"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Código postal</label>
            <Input
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              placeholder="080001"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Información adicional</label>
            <Input
              value={infoAdiccional}
              onChange={(e) => setInfoAdiccional(e.target.value)}
              placeholder="Apartamento 305, torre B"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="esPredeterminada"
            checked={esPredeterminada}
            onChange={(e) => setEsPredeterminada(e.target.checked)}
          />
          <label htmlFor="esPredeterminada" className="text-sm font-medium">Marcar como predeterminada</label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" disabled={isSaving} onClick={handleSave}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function MyDireccionesPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: direccionesQueryKey,
    queryFn: getMyDirecciones,
  })

  const createMutation = useMutation({
    mutationFn: createMyDireccion,
    onSuccess: () => {
      toast.success('Dirección creada')
      void queryClient.invalidateQueries({ queryKey: direccionesQueryKey })
      setShowForm(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo crear la dirección')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CreateDireccionInput }) =>
      updateMyDireccion(id, input),
    onSuccess: () => {
      toast.success('Dirección actualizada')
      void queryClient.invalidateQueries({ queryKey: direccionesQueryKey })
      setEditingId(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar la dirección')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMyDireccion,
    onSuccess: () => {
      toast.success('Dirección eliminada correctamente')
      void queryClient.invalidateQueries({ queryKey: direccionesQueryKey })
      setConfirmDeleteId(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar la dirección')),
  })

  const setPredeterminadaMutation = useMutation({
    mutationFn: setPredeterminada,
    onSuccess: () => {
      toast.success('Dirección predeterminada actualizada')
      void queryClient.invalidateQueries({ queryKey: direccionesQueryKey })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo establecer como predeterminada')),
  })

  const direcciones = data ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ConfirmModal
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null)
        }}
        title="Eliminar dirección"
        description="Si la dirección no tiene pedidos asociados, se eliminará de la base de datos. Si ya fue usada, solo se desactivará para conservar la trazabilidad."
        confirmText="Eliminar"
        confirmVariant="destructive"
        onConfirm={() => {
          if (confirmDeleteId === null) return
          deleteMutation.mutate(confirmDeleteId)
        }}
        isConfirming={deleteMutation.isPending}
      />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Mis direcciones</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus direcciones de entrega. Solo una puede ser predeterminada.
          </p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null) }} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Agregar dirección
        </Button>
      </div>

      {showForm && (
        <DireccionForm
          onCancel={() => setShowForm(false)}
          onSave={(input) => createMutation.mutate(input)}
          isSaving={createMutation.isPending}
        />
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-40" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="p-4">
            <p className="text-destructive">{getApiErrorMessage(error, 'Error al cargar direcciones')}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void queryClient.invalidateQueries({ queryKey: direccionesQueryKey })}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : direcciones.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Sin direcciones</h2>
              <p className="text-sm text-muted-foreground">
                No tienes direcciones guardadas. Agrega una para poder realizar compras.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar dirección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {direcciones.map((d) =>
            editingId === d.direccionId ? (
              <DireccionForm
                key={d.direccionId}
                direccion={d}
                onCancel={() => setEditingId(null)}
                onSave={(input) => updateMutation.mutate({ id: d.direccionId, input })}
                isSaving={updateMutation.isPending}
              />
            ) : (
              <Card key={d.direccionId} className={d.esPredeterminada ? 'border-blue-500/40 shadow-md' : 'border'}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary shrink-0" />
                      <div className="font-medium">{d.lineaDir}</div>
                    </div>
                    {d.esPredeterminada && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        <Star className="h-3 w-3 fill-blue-800" />
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {d.barrio} {d.codigoPostal && `• ${d.codigoPostal}`}
                  </div>
                  {d.infoAdiccional && (
                    <div className="text-xs text-muted-foreground italic">{d.infoAdiccional}</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(d.direccionId)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={d.esPredeterminada}
                      onClick={() => setPredeterminadaMutation.mutate(d.direccionId)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Predeterminar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={() => {
                        setConfirmDeleteId(d.direccionId)
                      }}
                    >
                      <Power className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  )
}
