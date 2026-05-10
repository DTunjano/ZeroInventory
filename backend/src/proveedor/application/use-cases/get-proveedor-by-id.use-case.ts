import { Injectable } from '@nestjs/common';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { Proveedor } from '../../domain/entity/proveedor.entity';

@Injectable()
export class GetProveedorByIdUseCase {
  constructor(private readonly proveedorRepo: ProveedorRepository) {}

  async ejecutar(id: number): Promise<Proveedor | null> {
    return this.proveedorRepo.getById(id);
  }
}
