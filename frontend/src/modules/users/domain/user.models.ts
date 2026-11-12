export const userRoles = ['ADMIN', 'EMPLOYEE', 'CUSTOMER'] as const
export type UserRole = (typeof userRoles)[number]
export interface ManagedUser {
  usuarioId: number
  username: string
  email: string | null
  telefono: string | null
  primerNombre: string | null
  segundoNombre: string | null
  primerApellido: string | null
  segundoApellido: string | null
  isActive: boolean
  roles: UserRole[]
}
export interface UserPage {
  data: ManagedUser[]
  total: number
  totalPages: number
}
export interface SaveUserInput {
  username: string
  password?: string
  email: string | null
  telefono: string | null
  primerNombre: string | null
  segundoNombre: string | null
  primerApellido: string | null
  segundoApellido: string | null
  roles: UserRole[]
  documento?: string
  isActive?: boolean
}
export interface UserFilters {
  username: string
  page: number
  isActive?: boolean
}
export interface UserRepository {
  list(filters: UserFilters): Promise<UserPage>
  save(id: number | undefined, input: SaveUserInput): Promise<ManagedUser>
  setActive(id: number, isActive: boolean): Promise<void>
}
