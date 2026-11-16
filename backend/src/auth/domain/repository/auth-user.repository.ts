import { AuthUser } from '../types/auth-user.type'

export abstract class AuthUserRepository {
  abstract findByUsername(username: string): Promise<AuthUser | null>
  abstract findById(usuarioId: number): Promise<AuthUser | null>
}
