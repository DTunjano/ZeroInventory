import type { PaginatedResult } from './product.models'

export interface Provider {
  proveedorId: number
  nombre: string
  isActive: boolean
}

export type ProviderFilters = {
  nombre?: string
  page?: number
  limit?: number
}

export type PaginatedProviders = PaginatedResult<Provider>
