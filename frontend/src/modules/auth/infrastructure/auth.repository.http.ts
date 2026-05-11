import { refreshHttp } from '@/infrastructure/http/refresh-http'

import type { AuthRepository } from '../domain/auth.repository'
import type { AuthSession, LoginCredentials } from '../domain/auth.models'

export class AuthHttpRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const { data } = await refreshHttp.post<AuthSession>('/auth/login', credentials)
    return data
  }

  async refresh(): Promise<AuthSession> {
    const { data } = await refreshHttp.post<AuthSession>('/auth/refresh')
    return data
  }

  async logout(): Promise<{ success: true }> {
    const { data } = await refreshHttp.post<{ success: true }>('/auth/logout')
    return data
  }
}

export const authRepository: AuthRepository = new AuthHttpRepository()
