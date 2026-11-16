import type { ProviderFilters, Provider } from '../domain/provider.models'
import { providerRepository } from '../infrastructure/provider.repository.http'

export async function listProviders(
  filters: ProviderFilters = { page: 1, limit: 100 },
): Promise<Provider[]> {
  const res = await providerRepository.list(filters)
  return res.data
}
