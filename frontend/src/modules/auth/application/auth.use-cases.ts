import { authRepository } from '../infrastructure/auth.repository.http'
import type { AuthSession, LoginCredentials, RegisterCredentials } from '../domain/auth.models'

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  return authRepository.login(credentials)
}

export async function register(credentials: RegisterCredentials): Promise<AuthSession> {
  return authRepository.register(credentials)
}

export async function refresh(): Promise<AuthSession | null> {
  return authRepository.refresh()
}

export async function logout(): Promise<{ success: true }> {
  return authRepository.logout()
}
