import { direccionesApi } from '../infrastructure/direcciones.api'
import type { CreateDireccionInput, DireccionView } from '../domain/direccion.models'

export async function getMyDirecciones(): Promise<DireccionView[]> {
  return direccionesApi.getMyDirecciones()
}

export async function createMyDireccion(input: CreateDireccionInput): Promise<DireccionView> {
  return direccionesApi.createMyDireccion(input)
}

export async function updateMyDireccion(direccionId: number, input: CreateDireccionInput): Promise<DireccionView> {
  return direccionesApi.updateMyDireccion(direccionId, input)
}

export async function deleteMyDireccion(direccionId: number): Promise<void> {
  return direccionesApi.deleteMyDireccion(direccionId)
}

export async function setPredeterminada(direccionId: number): Promise<void> {
  return direccionesApi.setPredeterminada(direccionId)
}
