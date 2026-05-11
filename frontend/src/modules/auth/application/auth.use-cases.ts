import { authRepository } from '../infrastructure/auth.repository.http'
import type { AuthSession, LoginCredentials } from '../domain/auth.models'

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  return authRepository.login(credentials)
}

export async function refresh(): Promise<AuthSession> {
  return authRepository.refresh()
}

export async function logout(): Promise<{ success: true }> {
  return authRepository.logout()
}
