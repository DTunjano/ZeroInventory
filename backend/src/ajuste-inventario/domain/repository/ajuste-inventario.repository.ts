import { FilterAjusteInventarioDTO } from '../../application/dto/filters-ajuste-inventario-dto';
import { AjusteInventario } from '../entity/ajuste-inventario.entity';

export abstract class AjusteInventarioRepository {
  abstract create(
    ajusteInventario: AjusteInventario,
  ): Promise<AjusteInventario>;
  abstract getById(
    ajusteInventarioId: number,
  ): Promise<AjusteInventario | null>;
  abstract getByProductoId(productoId: number): Promise<AjusteInventario[]>;
  abstract getByUsuarioId(usuarioId: number): Promise<AjusteInventario[]>;
  abstract getAll(filters?: FilterAjusteInventarioDTO): Promise<{
    data: AjusteInventario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(
    ajusteInventario: AjusteInventario,
  ): Promise<AjusteInventario>;
  abstract delete(ajusteInventarioId: number): Promise<boolean>;
}
