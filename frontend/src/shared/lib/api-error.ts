import { AxiosError } from 'axios'

type NestErrorBody = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (isObject(data)) {
      const body = data as NestErrorBody
      const message = body.message
      if (typeof message === 'string' && message.trim()) return message
      if (Array.isArray(message) && message.length) {
        const compact = message.filter(Boolean).join('\n')
        if (compact.trim()) return compact
      }
      if (typeof body.error === 'string' && body.error.trim()) return body.error
    }

    if (typeof error.message === 'string' && error.message.trim()) return error.message
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}
