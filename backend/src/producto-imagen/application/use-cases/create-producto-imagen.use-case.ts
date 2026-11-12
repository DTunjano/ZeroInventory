import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoImagenRepository } from '../../domain/repository/producto-imagen.repository';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';
import { validateProductImage } from '../validate-product-image';
import { ProductoRepository } from '../../../producto/domain/repository/producto.repository';

@Injectable()
export class CreateProductoImagenUseCase {
  constructor(
    private readonly productoImagenRepo: ProductoImagenRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productoRepo: ProductoRepository,
  ) {}

  async ejecutar(data: {
    productoId: number;
    url: Express.Multer.File;
  }): Promise<ProductoImagen> {
    validateProductImage(data.url);
    if (!await this.productoRepo.getById(data.productoId)) throw new NotFoundException('Producto no encontrado');
    const uploadResult = await this.cloudinaryService.uploadImage(data.url, {
      folder: 'zeroInventoryProducts',
    });

    const productoImagen = new ProductoImagen(
      0,
      data.productoId,
      uploadResult.secure_url,
      uploadResult.public_id,
      new Date(),
      new Date(),
    );

    try {
      return await this.productoImagenRepo.create(productoImagen);
    } catch (error) {
      await this.cloudinaryService.deleteImage(uploadResult.public_id);
      throw error;
    }
  }
}
