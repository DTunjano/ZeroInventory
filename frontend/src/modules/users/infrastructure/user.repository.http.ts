import { http } from '@/infrastructure/http/http'
import type {
  ManagedUser,
  UserPage,
  UserRepository,
} from '../domain/user.models'
export const userRepository: UserRepository = {
  async list(filters) {
    return (
      await http.get<UserPage>('/usuarios', {
        params: { ...filters, limit: 10 },
      })
    ).data
  },
  async save(id, input) {
    return (
      id === undefined
        ? await http.post<ManagedUser>('/usuarios', input)
        : await http.put<ManagedUser>(`/usuarios/${id}`, input)
    ).data
  },
  async setActive(id, isActive) {
    await http.put(`/usuarios/${id}`, { isActive })
  },
}
