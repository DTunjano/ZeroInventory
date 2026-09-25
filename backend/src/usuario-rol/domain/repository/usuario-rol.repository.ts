import { FiltersUsuarioRolDTO } from '../../application/dto/filters-usuario-rol-dto';
import { UsuarioRol } from '../entity/usuario-rol.entity';

export abstract class UsuarioRolRepository {
  abstract create(usuarioRol: UsuarioRol): Promise<UsuarioRol>;
  abstract getById(usuarioRolId: number): Promise<UsuarioRol | null>;
  abstract update(usuarioRol: UsuarioRol): Promise<UsuarioRol>;
  abstract delete(usuarioRolId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersUsuarioRolDTO): Promise<{
    data: UsuarioRol[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
