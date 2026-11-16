import { Producto } from '../../domain/entity/producto.entity';
import { ProductoEntityORM } from '../persistence/producto.orm-entity';

export class ProductoMapper {
  static toDomain(entity: ProductoEntityORM): Producto {
    return new Producto(
      entity.productoId,
      entity.proveedorId ?? null,
      entity.nombre,
      entity.cantidad,
      entity.precio,
      entity.descripcion,
      entity.sku,
      entity.marca,
      entity.material,
      entity.peso,
      entity.medida,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Producto): ProductoEntityORM {
    const entity = new ProductoEntityORM();
    if (domain.productoId > 0) entity.productoId = domain.productoId;
    entity.proveedorId = domain.proveedorId;
    entity.nombre = domain.nombre;
    entity.cantidad = domain.cantidad;
    entity.precio = domain.precio;
    entity.descripcion = domain.descripcion;
    entity.sku = domain.sku;
    entity.marca = domain.marca;
    entity.material = domain.material;
    entity.peso = domain.peso;
    entity.medida = domain.medida;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
