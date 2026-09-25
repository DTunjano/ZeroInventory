import { FiltersUsuarioDTO } from '../../application/dto/filters-usuario-dto';
import { Usuario } from '../entity/usuario.entity';

export abstract class UsuarioRepository {
  abstract create(usuario: Usuario): Promise<Usuario>;
  abstract getById(usuarioId: number): Promise<Usuario | null>;
  abstract getByUsername(username: string): Promise<Usuario | null>;
  abstract getAll(filters?: FiltersUsuarioDTO): Promise<{
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(usuario: Usuario): Promise<Usuario>;
  abstract delete(usuarioId: number): Promise<boolean>;
}
