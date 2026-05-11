import type { AuthSession, LoginCredentials } from './auth.models'

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>
  refresh(): Promise<AuthSession>
  logout(): Promise<{ success: true }>
}
