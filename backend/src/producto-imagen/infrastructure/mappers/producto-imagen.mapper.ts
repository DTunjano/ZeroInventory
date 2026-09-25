import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';
import { ProductoImagenEntityORM } from '../persistence/producto-imagen.orm-entity';

export class ProductoImagenMapper {
  static toDomain(entity: ProductoImagenEntityORM): ProductoImagen {
    return new ProductoImagen(
      entity.imagenProductoId,
      entity.productoId,
      entity.url,
      entity.publicId,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: ProductoImagen): ProductoImagenEntityORM {
    const entity = new ProductoImagenEntityORM();
    entity.imagenProductoId = domain.imagenProductoId;
    entity.productoId = domain.productoId;
    entity.url = domain.url;
    entity.publicId = domain.publicId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
