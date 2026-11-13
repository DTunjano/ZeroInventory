import { FiltersUsuarioDTO } from '../../application/dto/filters-usuario-dto';
import { Usuario } from '../entity/usuario.entity';
import { UsuarioAccess } from '../entity/usuario-access';

export abstract class UsuarioRepository {
  abstract create(usuario: Usuario, access?: UsuarioAccess): Promise<Usuario>;
  abstract getById(usuarioId: number): Promise<Usuario | null>;
  abstract getByUsername(username: string): Promise<Usuario | null>;
  abstract getByEmail(email: string): Promise<Usuario | null>;
  abstract getAll(filters?: FiltersUsuarioDTO): Promise<{
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(usuario: Usuario, access?: UsuarioAccess): Promise<Usuario>;
  abstract delete(usuarioId: number): Promise<boolean>;
}
