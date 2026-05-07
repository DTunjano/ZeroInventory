import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { Producto } from '../../domain/entity/producto.entity';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productoRepo: ProductoRepository) {}

  async ejecutar(
    productoId: number,
    cambios: {
      nombre?: string;
      cantidad?: number;
      precio?: number;
      descripcion?: string | null;
      sku?: string;
      marca?: string | null;
      material?: string | null;
      peso?: string | null;
      medida?: string | null;
      isActive?: boolean;
    },
  ): Promise<Producto> {
    const actual = await this.productoRepo.getById(productoId);
    if (!actual) {
      throw new NotFoundException('Producto no encontrado');
    }

    const producto = new Producto(
      actual.productoId,
      cambios.nombre ?? actual.nombre,
      cambios.cantidad ?? actual.cantidad,
      cambios.precio ?? actual.precio,
      cambios.descripcion ?? actual.descripcion,
      cambios.sku ?? actual.sku,
      cambios.marca ?? actual.marca,
      cambios.material ?? actual.material,
      cambios.peso ?? actual.peso,
      cambios.medida ?? actual.medida,
      cambios.isActive ?? actual.isActive,
      actual.createdAt,
      actual.updatedAt,
    );

    return this.productoRepo.update(producto);
  }
}
