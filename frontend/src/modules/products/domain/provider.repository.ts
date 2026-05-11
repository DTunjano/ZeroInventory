import type { PaginatedProviders, ProviderFilters } from './provider.models'

export interface ProviderRepository {
  list(filters?: ProviderFilters): Promise<PaginatedProviders>
}
