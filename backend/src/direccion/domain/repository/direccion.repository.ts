import { FiltersDireccionDTO } from '../../application/dto/filters-direccion-dto';
import { Direccion } from '../entity/direccion.entity';

export abstract class DireccionRepository {
  abstract create(direccion: Direccion): Promise<Direccion>;
  abstract getById(direccionId: number): Promise<Direccion | null>;
  abstract update(direccion: Direccion): Promise<Direccion>;
  abstract delete(direccionId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersDireccionDTO): Promise<{
    data: Direccion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
