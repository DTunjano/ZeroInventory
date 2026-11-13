import { ConflictException, Injectable } from '@nestjs/common';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { Proveedor } from '../../domain/entity/proveedor.entity';

@Injectable()
export class CreateProveedorUseCase {
  constructor(private readonly proveedorRepo: ProveedorRepository) {}

  async ejecutar(data: {
    nombre: string;
    nombreTitular?: string;
    telefono?: string;
    email?: string;
    isActive?: boolean;
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
      data.nombreTitular ?? null,
      data.telefono ?? null,
      data.email ?? null,
      data.isActive ?? true,
    );
    return this.proveedorRepo.create(proveedor);
  }
}
