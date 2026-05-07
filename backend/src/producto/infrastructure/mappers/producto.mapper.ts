import { Producto } from '../../domain/entity/producto.entity';
import { ProductoORMEntity } from '../persistence/producto.orm-entity';

export class ProductoMapper {
  static toDomain(entity: ProductoORMEntity): Producto {
    return new Producto(
      entity.productoId,
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

  static toPersistence(domain: Producto): ProductoORMEntity {
    const entity = new ProductoORMEntity();
    entity.productoId = domain.productoId;
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
