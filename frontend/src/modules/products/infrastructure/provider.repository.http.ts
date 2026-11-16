import { http } from '@/infrastructure/http/http'

import type { ProviderRepository } from '../domain/provider.repository'
import type { PaginatedProviders, ProviderFilters } from '../domain/provider.models'

export class ProviderHttpRepository implements ProviderRepository {
  async list(filters?: ProviderFilters): Promise<PaginatedProviders> {
    const { data } = await http.get<PaginatedProviders>('/proveedores', {
      params: filters,
    })
    return data
  }
}

export const providerRepository: ProviderRepository = new ProviderHttpRepository()
