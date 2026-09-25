import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoImagenRepository } from '../../domain/repository/producto-imagen.repository';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';

@Injectable()
export class DeleteProductoImagenUseCase {
  constructor(
    private readonly productoImagenRepo: ProductoImagenRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async ejecutar(id: number): Promise<void> {
    const productoImagen = await this.productoImagenRepo.getById(id);
    if (!productoImagen) {
      throw new NotFoundException('Imagen de producto no encontrada');
    }

    await this.cloudinaryService.deleteImage(productoImagen.publicId);

    const deleted = await this.productoImagenRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException('Imagen de producto no encontrada');
    }
  }
}
