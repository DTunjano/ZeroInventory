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

  async updateMyDireccion(direccionId: number, input: CreateDireccionInput): Promise<DireccionView> {
    const { data } = await http.put<DireccionView>(`/direcciones/${direccionId}`, input)
    return data
  }

  async deleteMyDireccion(direccionId: number): Promise<void> {
    await http.delete(`/direcciones/${direccionId}`)
  }

  async setPredeterminada(direccionId: number): Promise<void> {
    await http.post(`/direcciones/me/${direccionId}/predeterminada`)
  }
}

export const direccionesApi = new DireccionesHttpApi()
