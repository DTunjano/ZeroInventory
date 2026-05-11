export type AuthRole = string

export interface AuthUser {
  usuarioId: number
  username: string
  roles: AuthRole[]
}

export interface AuthSession {
  accessToken: string
  user: AuthUser
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  password: string
  documento: string
  tipoDocumento?: 'CC' | 'CE' | 'PASAPORTE'
  primerNombre?: string
  primerApellido?: string
}
