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
  paramsSerializer: {
    // Serialize arrays as repeated params: key=1&key=2
    serialize: (params) => {
      const parts: string[] = []
      const encode = (v: any) => encodeURIComponent(String(v))
      for (const key of Object.keys(params || {})) {
        const value = (params as any)[key]
        if (value === undefined || value === null) continue
        if (Array.isArray(value)) {
          for (const v of value) {
            parts.push(`${encode(key)}=${encode(v)}`)
          }
        } else {
          parts.push(`${encode(key)}=${encode(value)}`)
        }
      }
      return parts.join('&')
    },
  },
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
      .post<AuthSession | null>('/auth/refresh')
      .then((r) => {
        if (!r.data?.accessToken) throw new Error('La sesión ha expirado')
        return r.data
      })
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
