import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios'

import { env } from '@/core/env'
import { refreshHttp } from '@/infrastructure/http/refresh-http'
import { useAuthStore } from '@/modules/auth/application/auth.store'
import type { AuthSession } from '@/modules/auth/domain/auth.models'

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean }

export const http: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<AuthSession> | null = null

async function ensureFreshSession(): Promise<AuthSession> {
  if (!refreshPromise) {
    refreshPromise = refreshHttp
      .post<AuthSession>('/auth/refresh')
      .then((r) => r.data)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (!originalRequest || status !== 401) {
      return Promise.reject(error)
    }

    const url = String(originalRequest.url ?? '')
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh')
    if (isAuthRoute) {
      useAuthStore.getState().clearSession()
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      useAuthStore.getState().clearSession()
      return Promise.reject(error)
    }
    originalRequest._retry = true

    try {
      const data = await ensureFreshSession()
      useAuthStore.getState().setSession(data)

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

      return http(originalRequest)
    } catch {
      useAuthStore.getState().clearSession()
      return Promise.reject(error)
    }
  },
)
