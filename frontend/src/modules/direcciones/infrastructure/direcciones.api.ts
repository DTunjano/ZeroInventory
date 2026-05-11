import { http } from '@/infrastructure/http/http'

import type { CreateDireccionInput, DireccionView } from '../domain/direccion.models'

export const direccionesQueryKey = ['direcciones', 'me'] as const

export class DireccionesHttpApi {
  async getMyDirecciones(): Promise<DireccionView[]> {
    const { data } = await http.get<DireccionView[]>('/direcciones/me')
    return data
  }

  async createMyDireccion(input: CreateDireccionInput): Promise<DireccionView> {
    const { data } = await http.post<DireccionView>('/direcciones/me', input)
    return data
  }
}

export const direccionesApi = new DireccionesHttpApi()