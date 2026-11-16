export type Theme = 'dark' | 'light'

export interface UserProfile {
  username: string
  email: string | null
  telefono: string | null
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

export interface UpdateGeneralSettingsInput {
  username?: string
  email?: string | null
  telefono?: string | null
  primerNombre?: string | null
  segundoNombre?: string | null
  primerApellido?: string | null
  segundoApellido?: string | null
  address?: UserAddress | null
}

export interface UpdateAppearanceInput {
  theme: Theme
}

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
