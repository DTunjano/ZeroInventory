import { Injectable, NotFoundException } from '@nestjs/common';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { Proveedor } from '../../domain/entity/proveedor.entity';

@Injectable()
export class ToggleProveedorUseCase {
  constructor(private readonly proveedorRepo: ProveedorRepository) {}

  async ejecutar(proveedorId: number): Promise<Proveedor> {
    const actual = await this.proveedorRepo.getById(proveedorId);
    if (!actual) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return this.proveedorRepo.toggleActive(proveedorId);
  }
}
