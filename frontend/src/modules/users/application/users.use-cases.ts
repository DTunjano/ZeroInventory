import { userRepository } from '../infrastructure/user.repository.http'
import type { SaveUserInput, UserFilters } from '../domain/user.models'
export const listUsers = (filters: UserFilters) => userRepository.list(filters)
export const saveUser = (id: number | undefined, input: SaveUserInput) =>
  userRepository.save(id, input)
export const setUserActive = (id: number, isActive: boolean) =>
  userRepository.setActive(id, isActive)
