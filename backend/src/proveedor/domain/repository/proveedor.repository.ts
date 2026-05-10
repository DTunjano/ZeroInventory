import { FilterProveedorDTO } from '../../application/dto/filters-proveedor-dto';
import { Proveedor } from '../entity/proveedor.entity';

export abstract class ProveedorRepository {
  abstract create(proveedor: Proveedor): Promise<Proveedor>;
  abstract getById(proveedorId: number): Promise<Proveedor | null>;
  abstract getByNombre(nombre: string): Promise<Proveedor | null>;
  abstract getAll(filters?: FilterProveedorDTO): Promise<{
    data: Proveedor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(proveedor: Proveedor): Promise<Proveedor>;
  abstract delete(proveedorId: number): Promise<boolean>;
}
