import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoImagenRepository } from '../../domain/repository/producto-imagen.repository';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';

@Injectable()
export class UpdateProductoImagenUseCase {
  constructor(
    private readonly productoImagenRepo: ProductoImagenRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async ejecutar(
    imagenProductoId: number,
    cambios: {
      url?: any;
    },
  ): Promise<ProductoImagen> {
    const actual = await this.productoImagenRepo.getById(imagenProductoId);

    if (!actual) {
      throw new NotFoundException('Imagen de producto no encontrada');
    }

    if (cambios.url !== undefined) {
      await this.cloudinaryService.deleteImage(actual.publicId);

      const uploadResult = await this.cloudinaryService.uploadImage(
        cambios.url,
        {
          folder: 'ZeroInventory/Productos',
        },
      );

      actual.url = uploadResult.secure_url;
      actual.publicId = uploadResult.public_id;
    }

    actual.updatedAt = new Date();

    return this.productoImagenRepo.update(actual);
  }
}
