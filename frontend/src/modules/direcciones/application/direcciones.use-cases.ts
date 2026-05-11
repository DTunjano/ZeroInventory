import { direccionesApi } from '../infrastructure/direcciones.api'
import type { CreateDireccionInput, DireccionView } from '../domain/direccion.models'

export async function getMyDirecciones(): Promise<DireccionView[]> {
  return direccionesApi.getMyDirecciones()
}

export async function createMyDireccion(input: CreateDireccionInput): Promise<DireccionView> {
  return direccionesApi.createMyDireccion(input)
}