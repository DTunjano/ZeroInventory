import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoImagenRepository } from '../../domain/repository/producto-imagen.repository';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';
import { validateProductImage } from '../validate-product-image';

@Injectable()
export class UpdateProductoImagenUseCase {
  constructor(
    private readonly productoImagenRepo: ProductoImagenRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async ejecutar(
    imagenProductoId: number,
    cambios: {
      url?: Express.Multer.File;
    },
  ): Promise<ProductoImagen> {
    const actual = await this.productoImagenRepo.getById(imagenProductoId);

    if (!actual) {
      throw new NotFoundException('Imagen de producto no encontrada');
    }

    if (cambios.url !== undefined) {
      validateProductImage(cambios.url);
      const previousPublicId = actual.publicId;

      const uploadResult = await this.cloudinaryService.uploadImage(
        cambios.url,
        {
          folder: 'zeroInventoryProducts',
        },
      );

      const updated = new ProductoImagen(actual.imagenProductoId, actual.productoId, uploadResult.secure_url,
        uploadResult.public_id, actual.createdAt, new Date());
      let saved: ProductoImagen;
      try {
        saved = await this.productoImagenRepo.update(updated);
      } catch (error) {
        await this.cloudinaryService.deleteImage(uploadResult.public_id);
        throw error;
      }
      await this.cloudinaryService.deleteImage(previousPublicId);
      return saved;
    }

    actual.updatedAt = new Date();

    return this.productoImagenRepo.update(actual);
  }
}
