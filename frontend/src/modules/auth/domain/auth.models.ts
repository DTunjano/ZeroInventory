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
