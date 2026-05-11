import { ConflictException, Injectable } from '@nestjs/common';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { Producto } from '../../domain/entity/producto.entity';
import { ProveedorRepository } from '../../../proveedor/domain/repository/proveedor.repository';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productoRepo: ProductoRepository,
    private readonly proveedorRepo: ProveedorRepository,
  ) {}

  async ejecutar(data: {
    proveedorId?: number | null;
    nombre: string;
    cantidad: number;
    precio: number;
    descripcion?: string | null;
    sku: string;
    marca?: string | null;
    material?: string | null;
    peso?: string | null;
    medida?: string | null;
  }): Promise<Producto> {
    if (data.proveedorId != null) {
      const proveedor = await this.proveedorRepo.getById(data.proveedorId);
      if (!proveedor) {
        throw new ConflictException('Proveedor no encontrado');
      }
    }

    if (await this.productoRepo.existsByNombre(data.nombre)) {
      throw new ConflictException('Ya existe un producto con ese nombre');
    }

    if (await this.productoRepo.existsBySku(data.sku)) {
      throw new ConflictException('Ya existe un producto con ese SKU');
    }

    const producto = new Producto(
      0,
      data.proveedorId ?? null,
      data.nombre,
      data.cantidad,
      data.precio,
      data.descripcion ?? null,
      data.sku,
      data.marca ?? null,
      data.material ?? null,
      data.peso ?? null,
      data.medida ?? null,
      true,
      new Date(),
      new Date(),
    );
    return this.productoRepo.create(producto);
  }
}
