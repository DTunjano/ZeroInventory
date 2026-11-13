function readString(key: string): string | undefined {
  const value = (import.meta.env as Record<string, unknown>)[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

export const env = {
  apiUrl: readString('VITE_API_URL') ?? 'http://localhost:3000',
}
