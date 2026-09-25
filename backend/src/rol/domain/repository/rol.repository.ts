import { FiltersRolDTO } from '../../application/dto/filters-rol-dto';
import { Rol } from '../entity/rol.entity';

export abstract class RolRepository {
  abstract create(rol: Rol): Promise<Rol>;
  abstract getById(rolId: number): Promise<Rol | null>;
  abstract update(rol: Rol): Promise<Rol>;
  abstract delete(rolId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersRolDTO): Promise<{
    data: Rol[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
