import { Injectable } from '@nestjs/common';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { Producto } from '../../domain/entity/producto.entity';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productoRepo: ProductoRepository) {}

  async ejecutar(data: {
    nombre: string;
    cantidad: number;
    precio: number;
    descripcion: string | null;
    sku: string;
    marca: string | null;
    material: string | null;
    peso: string | null;
    medida: string | null;
  }): Promise<Producto> {
    const producto = new Producto(
      0,
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
