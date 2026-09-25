import { Injectable } from '@nestjs/common';
import { ProductoImagenRepository } from '../../domain/repository/producto-imagen.repository';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';

@Injectable()
export class CreateProductoImagenUseCase {
  constructor(
    private readonly productoImagenRepo: ProductoImagenRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async ejecutar(data: {
    productoId: number;
    url: any;
  }): Promise<ProductoImagen> {
    const uploadResult = await this.cloudinaryService.uploadImage(data.url, {
      folder: 'ZeroInventory/Productos',
    });

    const productoImagen = new ProductoImagen(
      0,
      data.productoId,
      uploadResult.url,
      uploadResult.public_id,
      new Date(),
      new Date(),
    );

    return this.productoImagenRepo.create(productoImagen);
  }
}
