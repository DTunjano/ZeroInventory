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
      nombreTitular?: string;
      telefono?: string;
      email?: string;
      isActive?: boolean;
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
      cambios.nombreTitular !== undefined
        ? cambios.nombreTitular
        : actual.nombreTitular,
      cambios.telefono !== undefined
        ? cambios.telefono
        : actual.telefono,
      cambios.email !== undefined ? cambios.email : actual.email,
      cambios.isActive !== undefined ? cambios.isActive : actual.isActive,
    );
    return this.proveedorRepo.update(proveedor);
  }
}
