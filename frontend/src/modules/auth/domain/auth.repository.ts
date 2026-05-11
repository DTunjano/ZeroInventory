import type { AuthSession, LoginCredentials, RegisterCredentials } from './auth.models'

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>
  register(credentials: RegisterCredentials): Promise<AuthSession>
  refresh(): Promise<AuthSession>
  logout(): Promise<{ success: true }>
}
