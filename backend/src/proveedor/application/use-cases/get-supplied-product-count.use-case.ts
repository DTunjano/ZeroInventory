import { Injectable, NotFoundException } from '@nestjs/common';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';

@Injectable()
export class GetSuppliedProductCountUseCase {
  constructor(private readonly proveedorRepo: ProveedorRepository) {}

  async ejecutar(proveedorId: number): Promise<number> {
    const proveedor = await this.proveedorRepo.getById(proveedorId);
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return this.proveedorRepo.getSuppliedProductCount(proveedorId);
  }
}
