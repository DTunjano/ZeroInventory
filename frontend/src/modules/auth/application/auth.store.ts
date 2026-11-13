import { create } from 'zustand'

import { login, logout, refresh, register } from './auth.use-cases'
import type { AuthResponseDTO, AuthUserDTO, LoginDTO, RegisterDTO } from './auth.types'
import { useCartStore } from '@/modules/cart/application/cart.store'

export type AuthStatus =
  | 'unknown'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'

export interface AuthState {
  status: AuthStatus
  accessToken: string | null
  user: AuthUserDTO | null

  setSession: (data: AuthResponseDTO) => void
  clearSession: () => void

  login: (dto: LoginDTO) => Promise<AuthResponseDTO>
  register: (dto: RegisterDTO) => Promise<AuthResponseDTO>
  refresh: () => Promise<string | null>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'unknown',
  accessToken: null,
  user: null,

  setSession: (data) => {
    set({
      status: 'authenticated',
      accessToken: data.accessToken,
      user: data.user,
    })
  },

  clearSession: () => {
    set({ status: 'unauthenticated', accessToken: null, user: null })
    useCartStore.setState({ items: {} })
  },

  login: async (dto) => {
    set({ status: 'loading' })
    try {
      const data = await login(dto)
      get().setSession(data)
      return data
    } catch (error) {
      set({ status: 'unauthenticated' })
      throw error
    }
  },

  register: async (dto) => {
    set({ status: 'loading' })
    try {
      const data = await register(dto)
      get().setSession(data)
      return data
    } catch (error) {
      set({ status: 'unauthenticated' })
      throw error
    }
  },

  refresh: async () => {
    set({ status: 'loading' })
    try {
      const data = await refresh()
      if (!data) {
        get().clearSession()
        return null
      }
      get().setSession(data)
      return data.accessToken
    } catch {
      get().clearSession()
      return null
    }
  },

  logout: async () => {
    try {
      await logout()
    } finally {
      get().clearSession()
    }
  },
}))
