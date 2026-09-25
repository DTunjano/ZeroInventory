import { Injectable, NotFoundException } from '@nestjs/common';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';

@Injectable()
export class DeleteProveedorUseCase {
  constructor(private readonly proveedorRepo: ProveedorRepository) {}

  async ejecutar(id: number): Promise<void> {
    const deleted = await this.proveedorRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Proveedor no encontrado');
    }
  }
}
