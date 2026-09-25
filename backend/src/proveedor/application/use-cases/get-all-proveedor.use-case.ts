import { Injectable } from '@nestjs/common';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { Proveedor } from '../../domain/entity/proveedor.entity';
import { FilterProveedorDTO } from '../dto/filters-proveedor-dto';

@Injectable()
export class GetAllProveedoresUseCase {
  constructor(private readonly proveedorRepo: ProveedorRepository) {}

  async ejecutar(filters?: FilterProveedorDTO): Promise<{
    data: Proveedor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.proveedorRepo.getAll(filters);
  }
}
