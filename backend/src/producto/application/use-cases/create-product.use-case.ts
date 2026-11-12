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

    // 1. Crear producto sin SKU definitivo (usamos placeholder para respetar UNIQUE/NOT NULL)
    const placeholderSku = `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const producto = new Producto(
      0,
      data.proveedorId ?? null,
      data.nombre,
      data.cantidad,
      data.precio,
      data.descripcion ?? null,
      placeholderSku,
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
