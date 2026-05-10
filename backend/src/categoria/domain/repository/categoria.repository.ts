import { FiltersCategoriaDTO } from '../../application/dto/filters-categoria-dto';
import { Categoria } from '../entity/categoria.entity';

export abstract class CategoriaRepository {
  abstract create(categoria: Categoria): Promise<Categoria>;
  abstract getById(categoriaId: number): Promise<Categoria | null>;
  abstract update(categoria: Categoria): Promise<Categoria>;
  abstract delete(categoriaId: number): Promise<boolean>;
  abstract getAll(filters?: FiltersCategoriaDTO): Promise<{
    data: Categoria[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract existsByNombre(nombre: string, excludeId?: number): Promise<boolean>;
}
