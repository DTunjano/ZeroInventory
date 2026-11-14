import { http } from '@/infrastructure/http/http'
import type { PurchaseRepository } from '../domain/purchase.repository'
import type { CompraDetalle, CompraPagina } from '../domain/purchase.models'
export const purchaseRepository: PurchaseRepository = {
  async list(params) {
    return (await http.get<CompraPagina>('/compras', { params })).data
  },
  async get(id) {
    return (await http.get<CompraDetalle>(`/compras/${id}`)).data
  },
  async create(input) {
    return (await http.post<CompraDetalle>('/compras', input)).data
  },
  async update(id, version, input) {
    return (
      await http.put<CompraDetalle>(`/compras/${id}`, { ...input, version })
    ).data
  },
  async receive(id, version) {
    return (
      await http.post<CompraDetalle>(`/compras/${id}/receive`, { version })
    ).data
  },
  async cancel(id, version, motivo) {
    return (
      await http.patch<CompraDetalle>(`/compras/${id}/cancel`, {
        version,
        motivo,
      })
    ).data
  },
}
