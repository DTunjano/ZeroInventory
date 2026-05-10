import { ConflictException, Injectable } from '@nestjs/common';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { Proveedor } from '../../domain/entity/proveedor.entity';

@Injectable()
export class CreateProveedorUseCase {
  constructor(private readonly proveedorRepo: ProveedorRepository) {}

  async ejecutar(data: {
    nombre: string;
    telefono?: string;
    email?: string;
  }): Promise<Proveedor> {
    const existingProveedorByNombre = await this.proveedorRepo.getByNombre(
      data.nombre,
    );
    if (existingProveedorByNombre) {
      throw new ConflictException('Ya existe un proveedor con ese nombre');
    }

    const proveedor = new Proveedor(
      0,
      data.nombre,
      data.telefono ?? null,
      data.email ?? null,
    );
    return this.proveedorRepo.create(proveedor);
  }
}
