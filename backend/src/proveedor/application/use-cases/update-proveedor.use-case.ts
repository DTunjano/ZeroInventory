import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { Proveedor } from '../../domain/entity/proveedor.entity';

@Injectable()
export class UpdateProveedorUseCase {
  constructor(private readonly proveedorRepo: ProveedorRepository) {}

  async ejecutar(
    proveedorId: number,
    cambios: {
      nombre?: string;
      telefono?: string;
      email?: string;
    },
  ): Promise<Proveedor> {
    const actual = await this.proveedorRepo.getById(proveedorId);
    if (!actual) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    if (cambios.nombre && cambios.nombre !== actual.nombre) {
      const existingProveedorByNombre = await this.proveedorRepo.getByNombre(
        cambios.nombre,
      );
      if (
        existingProveedorByNombre &&
        existingProveedorByNombre.proveedorId !== proveedorId
      ) {
        throw new ConflictException('Ya existe un proveedor con ese nombre');
      }
    }

    const proveedor = new Proveedor(
      actual.proveedorId,
      cambios.nombre ?? actual.nombre,
      cambios.telefono ?? actual.telefono,
      cambios.email ?? actual.email,
    );
    return this.proveedorRepo.update(proveedor);
  }
}
