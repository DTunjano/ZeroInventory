export type Theme = 'dark' | 'light'

export interface UserProfile {
  username: string
  email: string
  primerNombre: string | null
  segundoNombre: string | null
  primerApellido: string | null
  segundoApellido: string | null
  theme: Theme
}

export interface UserAddress {
  lineaDir: string
  barrio: string
  codigoPostal: string | null
  infoAdicional: string | null
}

export interface UserSettings {
  profile: UserProfile
  address: UserAddress | null
  theme: Theme
}

export interface UpdateSettingsInput {
  primerNombre?: string
  segundoNombre?: string
  primerApellido?: string
  segundoApellido?: string
  theme?: Theme
  address?: UserAddress
}

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
